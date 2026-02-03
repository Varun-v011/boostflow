"""
Email Sync Module for JobTracker
Automatically imports job applications from Gmail
"""

import os
import re
import json
import base64
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from email.utils import parsedate_to_datetime

# Gmail API imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False
    print("⚠️  Gmail libraries not installed. Run: pip install google-auth google-auth-oauthlib google-api-python-client")

# Gemini imports
try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Gmail API Configuration
GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# Email keywords for different statuses
EMAIL_KEYWORDS = {
    "Applied": [
        "thank you for applying",
        "thanks for applying",
        "application received",
        "we have received your application",
        "application confirmation"
    ],
    "Assessment": [
        "assessment",
        "test",
        "coding challenge",
        "take-home assignment",
        "complete the following",
        "technical challenge"
    ],
    "Interview": [
        "interview",
        "would like to schedule",
        "invitation to interview",
        "meet with",
        "video call",
        "phone screen",
        "schedule a call"
    ],
    "Rejected": [
        "unfortunately",
        "we have decided",
        "not moving forward",
        "selected other candidates",
        "regret to inform",
        "not selected",
        "pursue other candidates"
    ]
}

class EmailSyncService:
    """Service for syncing job-related emails from Gmail"""
    
    def __init__(self, gemini_api_key: Optional[str] = None):
        """
        Initialize email sync service
        
        Args:
            gemini_api_key: Optional Gemini API key for AI parsing
        """
        self.gemini_api_key = gemini_api_key
        self.gemini_client = None
        
        if gemini_api_key and GEMINI_AVAILABLE:
            self.gemini_client = genai.Client(api_key=gemini_api_key)
    
    def get_gmail_service(self):
        """Get authenticated Gmail API service"""
        if not GMAIL_AVAILABLE:
            raise Exception("Gmail libraries not installed")
        
        creds = None
        token_path = 'token.json'
        credentials_path = 'credentials.json'
        
        # Check if token exists
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, GMAIL_SCOPES)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(credentials_path):
                    raise Exception(
                        "Gmail credentials.json not found. "
                        "Download from Google Cloud Console and place in project root."
                    )
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_path, GMAIL_SCOPES
                )
                creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open(token_path, 'w') as token:
                token.write(creds.to_json())
        
        return build('gmail', 'v1', credentials=creds)
    
    def parse_email_with_gemini(self, email_content: str, subject: str) -> Optional[Dict]:
        """
        Use Gemini AI to parse email (OPTIMIZED FOR FREE TIER)
        
        Args:
            email_content: Email body content
            subject: Email subject line
            
        Returns:
            Dict with extracted job info or None if not job-related
        """
        if not self.gemini_client:
            return None
        
        try:
            # Truncate content to save tokens
            content = email_content[:1500]
            
            prompt = f"""Analyze this job email and extract info in JSON format:

Subject: {subject}
Content: {content}

Extract:
1. company_name: Company name (string)
2. position: Job title (string)
3. status: One of ["Applied", "Assessment", "Interview", "Rejected"]

Return ONLY valid JSON. If not job-related: {{"is_job_related": false}}

Example: {{"company_name": "Google", "position": "SWE", "status": "Interview", "is_job_related": true}}

JSON:"""

            # Use Gemini 2.0 Flash (most efficient for free tier)
            response = self.gemini_client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            
            # Parse response
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
            text = text.strip()
            
            result = json.loads(text)
            return result if result.get('is_job_related', True) else None
            
        except Exception as e:
            print(f"Gemini parsing error: {e}")
            return None
    
    def parse_email_with_keywords(self, email_content: str, subject: str) -> Optional[Dict]:
        """
        Parse email using keyword matching (NO API CALLS - FREE)
        
        Args:
            email_content: Email body content
            subject: Email subject line
            
        Returns:
            Dict with extracted job info or None if not job-related
        """
        email_text = (subject + " " + email_content).lower()
        
        # Check if job-related
        job_keywords = [
            'application', 'position', 'role', 'job', 'interview',
            'assessment', 'candidate', 'thank you for applying'
        ]
        if not any(keyword in email_text for keyword in job_keywords):
            return None
        
        # Determine status
        status = "Applied"  # default
        for status_type, keywords in EMAIL_KEYWORDS.items():
            if any(keyword in email_text for keyword in keywords):
                status = status_type
                break
        
        # Extract company name
        company_name = "Unknown Company"
        patterns = [
            r'from\s+([A-Z][a-zA-Z\s&]+?)(?:\s+team|\s+careers|\s+recruiting)',
            r'([A-Z][a-zA-Z\s&]+?)\s+(?:team|careers|recruiting|talent)',
            r'(?:at|@)\s+([A-Z][a-zA-Z\s&]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, subject + " " + email_content[:500])
            if match:
                company_name = match.group(1).strip()
                break
        
        # Extract position - IMPROVED
        position = "Position Not Specified"
        position_patterns = [
            # "Software Engineer position", "Data Analyst role"
            r'(?:to|for|as)\s+(?:the\s+)?(?:a\s+)?([A-Z][a-zA-Z\s\-/]+?)\s+(?:position|role|opening|job)',
            
            # "Position: Software Engineer", "Role: Data Analyst"
            r'(?:position|role|job title):\s*([A-Z][a-zA-Z\s\-/]+)',
            
            # "Applied to Software Engineer", "applying for Data Analyst"
            r'(?:applied to|applying for|application for)\s+(?:the\s+)?(?:a\s+)?([A-Z][a-zA-Z\s\-/]+)',
            
            # "Software Engineer - Google" pattern
            r'(?:^|\n)([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Analyst|Manager|Designer|Architect|Scientist|Specialist|Coordinator|Consultant|Lead))',
            
            # Match common job titles directly
            r'(Software Engineer|Data Analyst|Product Manager|Web Developer|Full Stack Developer|Frontend Developer|Backend Developer|DevOps Engineer|QA Engineer|UI/UX Designer|Business Analyst|Project Manager|Data Scientist|ML Engineer)',
        ]
        
        for pattern in position_patterns:
            match = re.search(pattern, subject + " " + email_content[:1000], re.IGNORECASE)
            if match:
                position = match.group(1).strip()[:100]
                # Clean up common suffixes
                position = re.sub(r'\s+(at|with|for)\s+.*$', '', position)
                break
        
        # ✅ RETURN STATEMENT
        return {
            "company_name": company_name,
            "position": position,
            "status": status,
            "is_job_related": True
        }
    
    def get_email_body(self, message: Dict) -> str:
        """
        Extract email body from Gmail message
        
        Args:
            message: Gmail message object
            
        Returns:
            Email body text
        """
        try:
            if 'parts' in message['payload']:
                for part in message['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data', '')
                        if data:
                            return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            
            data = message['payload']['body'].get('data', '')
            if data:
                return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error extracting email body: {e}")
        
        return ""
    
    def search_job_emails(
        self,
        days_back: int = 30,
        max_results: int = 50
    ) -> List[Dict]:
        """
        Search Gmail for job-related emails
        
        Args:
            days_back: How many days back to search
            max_results: Maximum number of emails to return
            
        Returns:
            List of Gmail message objects
        """
        service = self.get_gmail_service()
        
        # Calculate date for search
        after_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y/%m/%d')
        
        # Targeted search query
        query = (
            f'after:{after_date} '
            f'(subject:(application OR position OR interview OR assessment OR "thank you for applying") '
            f'OR from:(noreply OR careers OR recruiting OR talent OR jobs))'
        )
        
        # Get messages
        results = service.users().messages().list(
            userId='me',
            q=query,
            maxResults=max_results
        ).execute()
        
        return results.get('messages', [])
    
    def sync_emails(
        self,
        db_session,
        user_id: int,
        days_back: int = 30,
        use_ai: bool = False,
        Application=None,
        EmailSyncLog=None
    ) -> Dict:
        """
        Sync job-related emails from Gmail to database
        
        Args:
            db_session: SQLAlchemy database session
            user_id: User ID to sync for
            days_back: How many days back to search
            use_ai: Whether to use Gemini AI for parsing
            Application: Application model class
            EmailSyncLog: EmailSyncLog model class
            
        Returns:
            Dict with sync results
        """
        try:
            # Get Gmail service
            service = self.get_gmail_service()
            
            # Search for messages
            messages = self.search_job_emails(days_back=days_back, max_results=50)
            
            emails_processed = 0
            applications_added = 0
            applications_updated = 0
            errors = []
            
            # Get existing message IDs
            existing_ids = set()
            if Application:
                existing_apps = db_session.query(Application).filter(
                    Application.user_id == user_id,
                    Application.email_message_id.isnot(None)
                ).all()
                existing_ids = {app.email_message_id for app in existing_apps}
            
            ai_call_count = 0  # Track API calls
            
            for msg in messages:
                try:
                    # Skip if already processed
                    if msg['id'] in existing_ids:
                        continue
                    
                    # Get full message
                    message = service.users().messages().get(
                        userId='me',
                        id=msg['id']
                    ).execute()
                    
                    # Extract headers
                    headers = message['payload']['headers']
                    subject = next(
                        (h['value'] for h in headers if h['name'].lower() == 'subject'),
                        ''
                    )
                    date_header = next(
                        (h['value'] for h in headers if h['name'].lower() == 'date'),
                        ''
                    )
                    
                    # Parse date
                    try:
                        email_date = parsedate_to_datetime(date_header) if date_header else datetime.now()
                    except:
                        email_date = datetime.now()
                    
                    # Get email body
                    body = self.get_email_body(message)
                    
                    # Parse email (keyword matching first)
                    email_data = self.parse_email_with_keywords(body[:2000], subject)
                    
                    # Use AI if requested and available
                    if not email_data and use_ai and self.gemini_client and ai_call_count < 10:
                        email_data = self.parse_email_with_gemini(body[:1500], subject)
                        ai_call_count += 1
                        time.sleep(0.5)  # Rate limiting
                    
                    if not email_data:
                        continue
                    
                    emails_processed += 1
                    
                    # Check for duplicate
                    if Application:
                        existing_app = db_session.query(Application).filter(
                            Application.user_id == user_id,
                            Application.company == email_data['company_name'],
                            Application.position == email_data['position']
                        ).first()
                        
                        if existing_app:
                            # Update status if changed
                            if existing_app.status != email_data['status']:
                                existing_app.status = email_data['status']
                                existing_app.updated_at = datetime.utcnow()
                                applications_updated += 1
                        else:
                            # Create new application
                            new_app = Application(
                                user_id=user_id,
                                company=email_data['company_name'],
                                position=email_data['position'],
                                status=email_data['status'],
                                date_applied=email_date,
                                notes=None,
                                location=None,
                                email_message_id=msg['id'],
                                auto_imported=True
                            )
                            db_session.add(new_app)
                            applications_added += 1
                    
                except Exception as e:
                    errors.append(f"Email {msg['id'][:8]}: {str(e)[:50]}")
                    continue
            
            # Commit changes
            db_session.commit()
            
            # Log sync
            if EmailSyncLog:
                sync_log = EmailSyncLog(
                    user_id=user_id,
                    emails_processed=emails_processed,
                    applications_added=applications_added,
                    applications_updated=applications_updated,
                    status="success" if not errors else "partial",
                    error_message="; ".join(errors[:5]) if errors else None
                )
                db_session.add(sync_log)
                db_session.commit()
            
            return {
                "success": True,
                "emails_processed": emails_processed,
                "applications_added": applications_added,
                "applications_updated": applications_updated,
                "message": f"Synced {emails_processed} emails. Added {applications_added}, updated {applications_updated}. AI calls: {ai_call_count}",
                "errors": errors[:5] if errors else None,
                "ai_calls_used": ai_call_count
            }
            
        except HttpError as error:
            error_msg = f"Gmail API error: {error}"
            
            if EmailSyncLog:
                sync_log = EmailSyncLog(
                    user_id=user_id,
                    emails_processed=0,
                    applications_added=0,
                    applications_updated=0,
                    status="error",
                    error_message=error_msg
                )
                db_session.add(sync_log)
                db_session.commit()
            
            raise Exception(error_msg)
        
        except Exception as e:
            error_msg = f"Sync error: {str(e)}"
            
            if EmailSyncLog:
                sync_log = EmailSyncLog(
                    user_id=user_id,
                    emails_processed=0,
                    applications_added=0,
                    applications_updated=0,
                    status="error",
                    error_message=error_msg
                )
                db_session.add(sync_log)
                db_session.commit()
            
            raise Exception(error_msg)
    
    @staticmethod
    def is_gmail_setup() -> Dict:
        """
        Check if Gmail is properly set up
        
        Returns:
            Dict with setup status
        """
        return {
            "libraries_installed": GMAIL_AVAILABLE,
            "credentials_exists": os.path.exists('credentials.json'),
            "token_exists": os.path.exists('token.json'),
            "ready": GMAIL_AVAILABLE and os.path.exists('credentials.json')
        }

# Convenience function for easy import
def create_email_sync_service(gemini_api_key: Optional[str] = None) -> EmailSyncService:
    """
    Create an EmailSyncService instance
    
    Args:
        gemini_api_key: Optional Gemini API key
        
    Returns:
        EmailSyncService instance
    """
    return EmailSyncService(gemini_api_key=gemini_api_key)
