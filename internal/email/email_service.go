package email

import (
	"fmt"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	host     string
	port     int
	username string
	password string
	from     string
}

func NewEmailService() *EmailService {
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	return &EmailService{
		host:     os.Getenv("SMTP_HOST"),
		port:     port,
		username: os.Getenv("SMTP_USERNAME"),
		password: os.Getenv("SMTP_PASSWORD"),
		from:     os.Getenv("SMTP_FROM"),
	}
}

func (e *EmailService) SendOTP(to, code, purpose string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", e.from)
	m.SetHeader("To", to)

	var subject, body string

	switch purpose {
	case "registration":
		subject = "UNOR CIT Connect - Registration Verification Code"
		body = fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'JetBrains Mono', monospace; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-digits { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'JetBrains Mono', monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UNOR CIT Connect</h1>
            <p>Alumni Registration Verification</p>
        </div>
        <div class="content">
            <h2>Welcome to UNOR CIT Connect!</h2>
            <p>Thank you for registering for our 40th Anniversary Homecoming Celebration. To complete your registration, please use the verification code below:</p>
            
            <div class="otp-code">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-digits">%s</div>
                <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong> This code is valid for 10 minutes only. If you didn't request this verification, please ignore this email.</p>
            
            <p>We're excited to celebrate 40 years as a College and 25 years of IT Education in Western Visayas with you!</p>
            
            <p>Best regards,<br>
            <strong>UNOR CIT Connect Team</strong><br>
            University of Negros Occidental - Recoletos</p>
        </div>
        <div class="footer">
            <p>© 2025 UNOR CIT Connect. All rights reserved.</p>
            <p>Bacolod City, Philippines | unorcitconnect@gmail.com</p>
        </div>
    </div>
</body>
</html>`, code)
	case "nomination":
		subject = "UNOR CIT Connect - Nomination Verification Code"
		body = fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'JetBrains Mono', monospace; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px solid #f59e0b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-digits { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f59e0b; font-family: 'JetBrains Mono', monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UNOR CIT Connect</h1>
            <p>Outstanding Alumni Nomination</p>
        </div>
        <div class="content">
            <h2>Thank you for your nomination!</h2>
            <p>You are nominating an outstanding alumni for recognition. To proceed with your nomination, please use the verification code below:</p>
            
            <div class="otp-code">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-digits">%s</div>
                <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong> This code is valid for 10 minutes only. If you didn't request this verification, please ignore this email.</p>
            
            <p>Your nomination helps us recognize the achievements of our alumni community.</p>
            
            <p>Best regards,<br>
            <strong>UNOR CIT Connect Team</strong><br>
            University of Negros Occidental - Recoletos</p>
        </div>
        <div class="footer">
            <p>© 2025 UNOR CIT Connect. All rights reserved.</p>
            <p>Bacolod City, Philippines | unorcitconnect@gmail.com</p>
        </div>
    </div>
</body>
</html>`, code)
	case "sponsorship":
		subject = "UNOR CIT Connect - Sponsorship Application Verification Code"
		body = fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'JetBrains Mono', monospace; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%%, #7c3aed 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px solid #8b5cf6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-digits { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6; font-family: 'JetBrains Mono', monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UNOR CIT Connect</h1>
            <p>Sponsorship Application</p>
        </div>
        <div class="content">
            <h2>Thank you for your interest in sponsoring our event!</h2>
            <p>We appreciate your willingness to support our 40th Anniversary Homecoming Celebration. To proceed with your sponsorship application, please use the verification code below:</p>
            
            <div class="otp-code">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div class="otp-digits">%s</div>
                <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong> This code is valid for 10 minutes only. If you didn't request this verification, please ignore this email.</p>
            
            <p>Your sponsorship helps make our celebration memorable and supports our alumni community.</p>
            
            <p>Best regards,<br>
            <strong>UNOR CIT Connect Team</strong><br>
            University of Negros Occidental - Recoletos</p>
        </div>
        <div class="footer">
            <p>© 2025 UNOR CIT Connect. All rights reserved.</p>
            <p>Bacolod City, Philippines | unorcitconnect@gmail.com</p>
        </div>
    </div>
</body>
</html>`, code)
	default:
		return fmt.Errorf("unknown purpose: %s", purpose)
	}

	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(e.host, e.port, e.username, e.password)

	return d.DialAndSend(m)
}
