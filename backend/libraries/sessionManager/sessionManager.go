package sessionmanager

import (
	"sync"
	"time"
)

// in seconds, need to multiply by time.Second() to convert to second.
const cleanupInterval = 600
const sessionLength = 300

// could add more fields to this and store in db so user can see historical how they have done each session
type sessionData struct {
	UserID uint
	Expiry time.Time
}

func (sd sessionData) IsExpired() bool {
	return time.Now().After(sd.Expiry)
}

type SessionManager struct {
	mu       sync.RWMutex // mutex so we dont get any race conditions. Need to call mw.rLock() or mu.rwLock() and their corresponding unlock functions to use
	sessions map[string]sessionData

	stop   chan struct{}
	ticker *time.Ticker
}

func NewSessionManager() *SessionManager {
	sm := &SessionManager{
		sessions: make(map[string]sessionData),
		stop:     make(chan struct{}),
		ticker:   time.NewTicker(cleanupInterval * time.Second),
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
		}
	}
}

func (sm *SessionManager) Create(userID uint) (sessionID string) {
	randomSting := "test"

	sm.mu.Lock()         //gets full read wrtie lock
	defer sm.mu.Unlock() // unlocks after the function returns

	sm.sessions[randomSting] = sessionData{
		UserID: userID,
		Expiry: time.Now().Add(sessionLength * time.Second),
	}

	return randomSting
}

func (sm *SessionManager) Get(sessionID string) (sessionData, bool) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	data, ok := sm.sessions[sessionID]
	if !ok { // key was not found in map
		return sessionData{}, false
	}

	data.Expiry = time.Now().Add(sessionLength * time.Second)

	return data, true
}
