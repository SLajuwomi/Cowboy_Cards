package token

import (
	"time"

	"github.com/google/uuid"
)

type Payload struct {
	UserId    int32     `json:"userid"`
	Username  string    `json:"username"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiresAt time.Time `json:"expires_at"`
	TokenId   uuid.UUID `json:"tokenid"`
}

func GetPayload(userId int32, username string, duration time.Duration) (payload *Payload, err error) {
	tokenId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload = &Payload{
		UserId:    userId,
		Username:  username,
		IssuedAt:  time.Now(),
		ExpiresAt: time.Now().Add(duration),
		TokenId:   tokenId,
	}

	return
}
