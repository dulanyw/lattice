package main

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

const (
	defaultPort = 4173
	appTitle    = "<title>Lattice"
	portFile    = "lattice-port.txt"
)

var version = "dev"

func main() {
	if versionRequested() {
		fmt.Printf("Lattice server %s\n", version)
		return
	}

	root := appRoot()
	port := configuredPort(root)
	url := fmt.Sprintf("http://localhost:%d", port)

	if portIsListening(port) {
		if looksLikeLattice(url) {
			openBrowser(url)
			return
		}
		messageBox(
			"Lattice could not start",
			fmt.Sprintf("Port %d is already being used by another application.", port),
		)
		os.Exit(1)
	}

	server := &http.Server{
		Addr:              fmt.Sprintf("127.0.0.1:%d", port),
		Handler:           noCache(http.FileServer(http.Dir(root))),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			messageBox("Lattice could not start", err.Error())
			os.Exit(1)
		}
	}()

	for attempt := 0; attempt < 30; attempt++ {
		if portIsListening(port) {
			openBrowser(url)
			select {}
		}
		time.Sleep(100 * time.Millisecond)
	}

	messageBox("Lattice could not start", "The local server did not become ready in time.")
	os.Exit(1)
}

func versionRequested() bool {
	for _, arg := range os.Args[1:] {
		if arg == "--version" || arg == "-version" || arg == "version" {
			return true
		}
	}
	return false
}

func configuredPort(root string) int {
	if port, ok := portFromArgs(); ok {
		return port
	}
	if port, ok := parsePort(os.Getenv("LATTICE_PORT")); ok {
		return port
	}
	if content, err := os.ReadFile(filepath.Join(root, portFile)); err == nil {
		if port, ok := parsePort(string(content)); ok {
			return port
		}
	}
	return defaultPort
}

func portFromArgs() (int, bool) {
	for i, arg := range os.Args[1:] {
		if arg == "--port" && i+2 < len(os.Args) {
			if port, ok := parsePort(os.Args[i+2]); ok {
				return port, true
			}
		}
		if strings.HasPrefix(arg, "--port=") {
			if port, ok := parsePort(strings.TrimPrefix(arg, "--port=")); ok {
				return port, true
			}
		}
	}
	return 0, false
}

func parsePort(value string) (int, bool) {
	value = strings.TrimSpace(value)
	if strings.Contains(value, "\n") {
		value = strings.TrimSpace(strings.SplitN(value, "\n", 2)[0])
	}
	port, err := strconv.Atoi(value)
	return port, err == nil && port > 0 && port < 65536
}

func appRoot() string {
	exe, err := os.Executable()
	if err != nil {
		if wd, wdErr := os.Getwd(); wdErr == nil {
			return wd
		}
		return "."
	}
	return filepath.Dir(exe)
}

func portIsListening(port int) bool {
	conn, err := net.DialTimeout("tcp", fmt.Sprintf("127.0.0.1:%d", port), 250*time.Millisecond)
	if err != nil {
		return false
	}
	_ = conn.Close()
	return true
}

func looksLikeLattice(url string) bool {
	client := http.Client{Timeout: 2 * time.Second}
	response, err := client.Get(url)
	if err != nil {
		return false
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 4096))
	return err == nil && strings.Contains(string(body), appTitle)
}

func noCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func openBrowser(url string) {
	shell32 := syscall.NewLazyDLL("shell32.dll")
	proc := shell32.NewProc("ShellExecuteW")
	openPtr, _ := syscall.UTF16PtrFromString("open")
	urlPtr, _ := syscall.UTF16PtrFromString(url)
	proc.Call(0, uintptr(unsafe.Pointer(openPtr)), uintptr(unsafe.Pointer(urlPtr)), 0, 0, 1)
}

func messageBox(title, text string) {
	user32 := syscall.NewLazyDLL("user32.dll")
	proc := user32.NewProc("MessageBoxW")
	titlePtr, _ := syscall.UTF16PtrFromString(title)
	textPtr, _ := syscall.UTF16PtrFromString(text)
	proc.Call(0, uintptr(unsafe.Pointer(textPtr)), uintptr(unsafe.Pointer(titlePtr)), 0)
}
