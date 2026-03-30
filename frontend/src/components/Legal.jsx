import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Legal = () => {
  const { page } = useParams();
  const navigate = useNavigate();

  const legalContent = {
    privacy: {
      title: 'Privacy Policy',
      content: `
        <div class="legal-content">
          <h1>Privacy Policy</h1>
          <p>Last updated: March 30, 2026</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Resume/CV content and personal data</li>
            <li>Payment information processed through Razorpay</li>
            <li>Usage data and preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Generate and customize your resume</li>
            <li>Process payments and provide our services</li>
            <li>Communicate with you regarding your requests</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Data Retention and Deletion</h2>
          <p><strong>Data Clause:</strong> All uploaded PII and generated resumes are purged from our servers 2 hours after the session expires.</p>

          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Razorpay:</strong> Payment processing (see Razorpay Privacy Policy)</li>
            <li><strong>Google Gemini:</strong> AI-powered resume generation</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>For any questions regarding this Privacy Policy, please contact us at:</p>
          <p><a href="mailto:smk060506@gmail.com">smk060506@gmail.com</a></p>
        </div>
      `,
    },
    terms: {
      title: 'Terms of Service',
      content: `
        <div class="legal-content">
          <h1>Terms of Service</h1>
          <p>Last updated: March 30, 2026</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using our service, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily view the materials (information or software) on our website for personal, non-commercial transitory viewing only.</p>

          <h2>3. Resume Generation Services</h2>
          <p>Our AI-powered resume generation service provides templates and content suggestions. You are responsible for the accuracy and appropriateness of the final resume content.</p>

          <h2>4. Payment Terms</h2>
          <p>All payments are processed securely through Razorpay. By using our service, you agree to pay all charges incurred by you or any user authorized by you.</p>

          <h2>5. Refund Policy</h2>
          <p><strong>Refund Clause:</strong> Refunds for failed PDF generations are initiated automatically via the dashboard within 24-48 hours.</p>
          <p>For other refund requests, please contact us at <a href="mailto:smk060506@gmail.com">smk060506@gmail.com</a></p>

          <h2>6. Disclaimer</h2>
          <p>The materials on our website are provided "as is" without any warranties of any kind, either express or implied.</p>

          <h2>7. Limitations</h2>
          <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use our materials.</p>

          <h2>8. Revisions and Errata</h2>
          <p>We may revise these terms of service for our website at any time without notice.</p>

          <h2>9. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>

          <h2>10. Contact Us</h2>
          <p>For any questions regarding these Terms of Service, please contact us at:</p>
          <p><a href="mailto:smk060506@gmail.com">smk060506@gmail.com</a></p>
        </div>
      `,
    },
    refund: {
      title: 'Refund Policy',
      content: `
        <div class="legal-content">
          <h1>Refund Policy</h1>
          <p>Last updated: March 30, 2026</p>
          
          <h2>1. Automatic Refunds for Failed Generations</h2>
          <p><strong>Refund Clause:</strong> Refunds for failed PDF generations are initiated automatically via the dashboard within 24-48 hours.</p>
          <p>If your resume generation fails due to technical issues, system errors, or any other circumstances beyond our control, a refund will be automatically processed.</p>

          <h2>2. Manual Refund Requests</h2>
          <p>For refund requests not covered by automatic refunds, please contact us at <a href="mailto:smk060506@gmail.com">smk060506@gmail.com</a> with the following information:</p>
          <ul>
            <li>Your order ID or transaction reference</li>
            <li>Reason for the refund request</li>
            <li>Any supporting documentation</li>
          </ul>

          <h2>3. Refund Processing Time</h2>
          <p>Refunds are typically processed within:</p>
          <ul>
            <li><strong>24-48 hours:</strong> Automatic refunds for failed generations</li>
            <li><strong>5-7 business days:</strong> Manual refund requests after review</li>
          </ul>
          <p>The time for refunds to appear in your account may vary depending on your payment method and bank.</p>

          <h2>4. Eligibility for Refunds</h2>
          <p>We offer refunds in the following cases:</p>
          <ul>
            <li>Technical failures preventing resume generation</li>
            <li>System errors during the generation process</li>
            <li>Duplicate payments</li>
            <li>Unauthorized charges</li>
          </ul>

          <h2>5. Non-Refundable Cases</h2>
          <p>Refunds may not be available in the following cases:</p>
          <ul>
            <li>Successful resume generation that you choose not to use</li>
            <li>Changes to resume content after generation</li>
            <li>Issues caused by incorrect or incomplete information provided by you</li>
            <li>Requests made more than 30 days after the transaction</li>
          </ul>

          <h2>6. Contact Us</h2>
          <p>For any questions regarding this Refund Policy or to request a refund, please contact us at:</p>
          <p><a href="mailto:smk060506@gmail.com">smk060506@gmail.com</a></p>
        </div>
      `,
    },
  };

  const content = legalContent[page] || legalContent.privacy;

  return (
    <div className="legal-page">
      <Navbar />
      <div className="legal-container">
        <div 
          className="legal-content-wrapper"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Legal;
