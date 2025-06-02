package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type User struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required"`
}

var (
	kid = "9aba151e8db6c160a6a4"
	aud = "choi-custom-user"

	port = ":8080" // 서버를 8080 포트에서 실행
)

func main() {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	r.Use(cors.New(
		cors.Config{
			AllowOrigins: []string{"*"}, // 모든 origin 허용
			AllowMethods: []string{"*"}, // 모든 HTTP 메서드 허용
			AllowHeaders: []string{"*"}, // 모든 헤더 허용
			MaxAge:       12 * time.Hour,
		}))

	r.POST("/getToken", getToken)

	fmt.Printf("Listening and serving HTTP on %s ...\n", port)
	r.Run(port)
}

func getToken(c *gin.Context) {
	var newUser User
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := sign(&newUser)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	c.IndentedJSON(http.StatusOK, gin.H{"token": token})
}

func sign(_newUser *User) (string, error) {

	// 1. 개인 키 로드
	_, filename, _, _ := runtime.Caller(0)
	root := filepath.Dir(filename)
	privateKeyData, err := os.ReadFile(filepath.Join(root, "secret", "privateKey.pem"))

	if err != nil {
		return "", fmt.Errorf("failed to read private key: %v", err)
	}

	// 2. PEM -> RSA Private Key 파싱
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(privateKeyData)
	if err != nil {
		return "", fmt.Errorf("failed to parse RSA private key: %v", err)
	}

	// 3. JWT Payload 정의
	claims := jwt.MapClaims{
		"sub":   uuid.NewString(),
		"name":  _newUser.Name,
		"email": _newUser.Email,
		"aud":   aud,
		"iat":   time.Now().Unix(), // ✅ iat: 현재 시각 (Unix timestamp)
		"exp":   time.Now().Add(time.Hour).Unix(),
	}

	// 4. JWT 생성
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	// 5. kid 헤더 설정
	token.Header["kid"] = kid

	// 6. 서명하여 JWT 문자열 생성
	signedToken, err := token.SignedString(privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %v", err)
	}

	return signedToken, nil
}
