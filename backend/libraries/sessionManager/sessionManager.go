package sessionmanager

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"sync"
	"time"
)

// in seconds, need to multiply by time.Second() to convert to second.
const cleanupInterval = 600
const sessionLength = 300

// could add more fields to this and store in db so user can see historical how they have done each session
type sessionData struct {
	UserID    uint
	SessionID string
	Expiry    time.Time
}

func (sd sessionData) IsExpired() bool {
	return time.Now().After(sd.Expiry)
}

type SessionManager struct {
	mu          sync.RWMutex           // mutex so we dont get any race conditions. Need to call mw.rLock() or mu.rwLock() and their corresponding unlock functions to use
	sessions    map[string]sessionData // maps session ID to session data
	idToSession map[uint]sessionData

	stop   chan struct{}
	ticker *time.Ticker
}

func NewSessionManager() *SessionManager {
	sm := &SessionManager{
		sessions:    make(map[string]sessionData),
		idToSession: make(map[uint]sessionData),
		stop:        make(chan struct{}),
		ticker:      time.NewTicker(cleanupInterval * time.Second),
	}

	go sm.cleanUpSessions()

	return sm
}

func (sm *SessionManager) cleanUpSessions() {
	for {
		select {
		case <-sm.ticker.C: // clean up interval, clean up expired sessions
			sm.deleteExpired()
		case <-sm.stop: // program shutting down or something
			sm.ticker.Stop()
			return
		}
	}
}

func (sm *SessionManager) deleteExpired() {

	sm.mu.Lock()         // gets full read write lock
	defer sm.mu.Unlock() // unlock the lock after the function call

	for id, data := range sm.sessions {
		if data.IsExpired() {
			delete(sm.sessions, id)
			log.Println("removed ", id, " from active sessions due to expiry")
		}
	}
}

func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (sm *SessionManager) Create(userID uint) (sessionID string) {
	randomString, err := generateRandomString(32)
	if err != nil {
		panic(err)
	}

	sm.mu.Lock()         //gets full read write lock
	defer sm.mu.Unlock() // unlocks after the function returns

	sm.sessions[randomString] = sessionData{
		UserID:    userID,
		SessionID: randomString,
		Expiry:    time.Now().Add(sessionLength * time.Second),
	}

	sm.idToSession[uint(userID)] = sm.sessions[randomString]

	return randomString
}

func (sm *SessionManager) Get(sessionID string) (sessionData, bool) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	data, ok := sm.sessions[sessionID]
	if !ok { // key was not found in map
		return sessionData{}, false
	}

	data.Expiry = time.Now().Add(sessionLength * time.Second)
	sm.sessions[sessionID] = data

	return data, true
}

func (sm *SessionManager) ActiveSessions() int {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return len(sm.sessions)
}

func (sm *SessionManager) CheckIfActiveSession(userID uint) (sessionData, bool) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	session, ok := sm.idToSession[userID]
	if !ok || session.IsExpired() {
		return sessionData{}, false
	}
	return session, true
}

func (sm *SessionManager) Delete(sessionID string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	data, ok := sm.sessions[sessionID]
	if !ok {
		return
	}

	delete(sm.sessions, sessionID)
	delete(sm.idToSession, data.UserID)
}
