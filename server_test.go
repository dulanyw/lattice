package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestParsePort(t *testing.T) {
	tests := []struct {
		value string
		ok    bool
		port  int
	}{
		{"4173", true, 4173},
		{" 4174\n", true, 4174},
		{"0", false, 0},
		{"65536", false, 0},
		{"abc", false, 0},
	}
	for _, test := range tests {
		port, ok := parsePort(test.value)
		if ok != test.ok || (ok && port != test.port) {
			t.Fatalf("parsePort(%q) = (%d, %v), want (%d, %v)", test.value, port, ok, test.port, test.ok)
		}
	}
}

func TestConfiguredPortPrecedence(t *testing.T) {
	temp := t.TempDir()
	if err := os.WriteFile(filepath.Join(temp, portFile), []byte("4175\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("LATTICE_PORT", "4174")
	originalArgs := os.Args
	t.Cleanup(func() { os.Args = originalArgs })
	os.Args = []string{"lattice-server.exe", "--port", "4176"}
	if got := configuredPort(temp); got != 4176 {
		t.Fatalf("configuredPort with args = %d, want 4176", got)
	}
	os.Args = []string{"lattice-server.exe"}
	if got := configuredPort(temp); got != 4174 {
		t.Fatalf("configuredPort with env = %d, want 4174", got)
	}
	t.Setenv("LATTICE_PORT", "")
	if got := configuredPort(temp); got != 4175 {
		t.Fatalf("configuredPort with file = %d, want 4175", got)
	}
}

func TestVersionRequested(t *testing.T) {
	originalArgs := os.Args
	t.Cleanup(func() { os.Args = originalArgs })
	os.Args = []string{"lattice-server.exe", "--version"}
	if !versionRequested() {
		t.Fatal("versionRequested should accept --version")
	}
	os.Args = []string{"lattice-server.exe", "--port", "4173"}
	if versionRequested() {
		t.Fatal("versionRequested should ignore normal launch arguments")
	}
}
