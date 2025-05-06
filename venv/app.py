# app.py
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
import os
from datetime import datetime
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Initialize extensions
db = SQLAlchemy(app)
mail = Mail(app)

# Models
class ContactSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    image_path = db.Column(db.String(200))
    department = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables before first request
@app.before_first_request
def create_tables():
    db.create_all()
    # Add sample team members if none exist
    if not TeamMember.query.first():
        sample_members = [
            TeamMember(
                name="Michael Otieno",
                position="Founder & CEO",
                bio="With over 25 years in construction, Michael leads our strategic vision and company growth.",
                image_path="team/ceo.jpg",
                department="Leadership"
            ),
            # Add more sample members as needed
        ]
        db.session.bulk_save_objects(sample_members)
        db.session.commit()

# Routes
@app.route('/')
def home():
    current_year = datetime.now().year
    return render_template('index.html', current_year=current_year)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/team')
def team():
    members = TeamMember.query.filter_by(is_active=True).order_by(TeamMember.department).all()
    departments = sorted({member.department for member in members})
    return render_template('team.html', team_members=members, departments=departments)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            email = request.form.get('email')
            subject = request.form.get('subject')
            message = request.form.get('message')
            
            # Save to database
            new_contact = ContactSubmission(
                name=name,
                email=email,
                subject=subject,
                message=message
            )
            db.session.add(new_contact)
            db.session.commit()
            
            # Send email notification
            msg = Message(
                subject=f"New Contact Submission: {subject}",
                recipients=[os.getenv('ADMIN_EMAIL')],
                body=f"""
                New contact form submission:
                
                Name: {name}
                Email: {email}
                Subject: {subject}
                Message: {message}
                
                Submitted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                """
            )
            mail.send(msg)
            
            # Send confirmation to user
            user_msg = Message(
                subject="Thank you for contacting Hexyles Global",
                recipients=[email],
                body=f"""
                Dear {name},
                
                Thank you for contacting Hexyles Global. We have received your message and will respond within 48 hours.
                
                Your message:
                {message}
                
                Best regards,
                The Hexyles Global Team
                """
            )
            mail.send(user_msg)
            
            flash('Your message has been sent successfully! We will contact you soon.', 'success')
            return redirect(url_for('contact'))
            
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error processing contact form: {str(e)}")
            flash('An error occurred while sending your message. Please try again later.', 'danger')
    
    return render_template('contact.html')

# API Endpoints
@app.route('/api/contact', methods=['POST'])
def api_contact():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')
        
        if not all([name, email, message]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
            
        new_contact = ContactSubmission(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        db.session.add(new_contact)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your message! We will contact you soon.'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'An error occurred. Please try again later.'
        }), 500

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    # Log the error
    app.logger.error(f"500 Error: {str(e)}")
    
    # Create error context
    error_context = {
        'error_code': 500,
        'error_message': str(e) or 'Internal Server Error',
        'timestamp': datetime.now().isoformat(),
        'path': request.path
    }
    
    return render_template('500.html', error_context=error_context), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    # Run the application
    app.run(debug=True)

    

    from flask import Flask, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__)

# Payment Configurations
PAYMENT_CONFIG = {
    'equity': {
        'api_url': 'https://api.equitybankgroup.com/v1/payments',
        'api_key': 'YOUR_EQUITY_API_KEY'
    },
    'coop': {
        'api_url': 'https://developer.co-opbank.co.ke/api/payments',
        'api_key': 'YOUR_COOP_API_KEY'
    },
    'mpesa': {
        'api_url': 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        'consumer_key': 'YOUR_MPESA_CONSUMER_KEY',
        'consumer_secret': 'YOUR_MPESA_CONSUMER_SECRET'
    }
}

@app.route('/initiate-payment', methods=['POST'])
def initiate_payment():
    data = request.json
    payment_method = data['payment_method']
    amount = data['amount']
    phone = data.get('phone', '')
    account = data.get('account', '')
    
    try:
        if payment_method == 'mpesa':
            return mpesa_payment(amount, phone)
        elif payment_method == 'equity':
            return equity_payment(amount, account)
        elif payment_method == 'coop':
            return coop_payment(amount, account)
        else:
            return jsonify({'error': 'Invalid payment method'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def mpesa_payment(amount, phone):
    # Generate M-Pesa access token
    auth = (PAYMENT_CONFIG['mpesa']['consumer_key'], PAYMENT_CONFIG['mpesa']['consumer_secret'])
    token_response = requests.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        auth=auth
    )
    access_token = token_response.json().get('access_token')
    
    # STK Push
    payload = {
        "BusinessShortCode": "174379",
        "Password": generate_mpesa_password(),
        "Timestamp": datetime.now().strftime("%Y%m%d%H%M%S"),
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": "174379",
        "PhoneNumber": phone,
        "CallBackURL": "https://yourdomain.com/mpesa-callback",
        "AccountReference": "HEXYLES",
        "TransactionDesc": "Construction Services" 
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        PAYMENT_CONFIG['mpesa']['api_url'],
        json=payload,
        headers=headers
    )
    
    return response.json()

def equity_payment(amount, account):
    headers = {
        "Authorization": f"Bearer {PAYMENT_CONFIG['equity']['api_key']}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "account_number": account,
        "amount": amount,
        "reference": f"HEXYLES-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "description": "Construction Services Payment"
    }
    
    response = requests.post(
        PAYMENT_CONFIG['equity']['api_url'],
        json=payload,
        headers=headers
    )
    
    return response.json()

def coop_payment(amount, account):
    headers = {
        "X-Api-Key": PAYMENT_CONFIG['coop']['api_key'],
        "Content-Type": "application/json"
    }
    
    payload = {
        "accountNumber": account,
        "transactionAmount": amount,
        "transactionReference": f"HEX-{datetime.now().timestamp()}",
        "narration": "Payment for construction services"
    }
    
    response = requests.post(
        PAYMENT_CONFIG['coop']['api_url'],
        json=payload,
        headers=headers
    )
    
    return response.json()

def generate_mpesa_password():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return base64.b64encode(f"174379{YOUR_MPESA_PASSKEY}{timestamp}".encode()).decode()

if __name__ == '__main__':
    app.run(ssl_context='adhoc')  # HTTPS required for payment APIs