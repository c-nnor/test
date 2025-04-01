<template>
  <div class="privacy-policy">
    <div class="container">
      <h1>Privacy Policy for Travel Path Manager</h1>
      <p class="last-updated">Last Updated: {{ formattedDate }}</p>
      
      <section>
        <h2>Introduction</h2>
        <p>
          This privacy policy explains how Travel Path Manager ("we", "us", or "our") collects, uses, 
          and protects your information when you use our mobile application.
        </p>
      </section>
      
      <section>
        <h2>Information We Collect</h2>
        
        <h3>Personal Information</h3>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Store location</li>
          <li>Authentication credentials</li>
        </ul>
        
        <h3>Usage Data</h3>
        <ul>
          <li>Travel path completion records</li>
          <li>Schedule and timing information</li>
          <li>QR code scan data</li>
          <li>App usage statistics</li>
        </ul>
        
        <h3>Device Permissions</h3>
        <p>Our app requires access to:</p>
        <ul>
          <li>Camera (for QR code scanning)</li>
          <li>Internet connection</li>
          <li>Local storage</li>
        </ul>
      </section>
      
      <section>
        <h2>How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide and maintain our service</li>
          <li>Authenticate users</li>
          <li>Track travel path completions</li>
          <li>Generate performance reports</li>
          <li>Improve our service</li>
          <li>Communicate with you about service updates</li>
        </ul>
      </section>
      
      <section>
        <h2>Data Storage and Security</h2>
        <ul>
          <li>We store your data securely on our servers</li>
          <li>Authentication tokens are stored locally on your device</li>
          <li>We use industry-standard security measures to protect your data</li>
          <li>We retain your data only as long as necessary for service provision</li>
        </ul>
      </section>
      
      <section>
        <h2>Data Sharing</h2>
        <p>We do not share your personal information with third parties except:</p>
        <ul>
          <li>When required by law</li>
          <li>With your explicit consent</li>
          <li>With McDonald's management (for store performance tracking)</li>
        </ul>
      </section>
      
      <section>
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of certain data collection</li>
          <li>Export your data</li>
        </ul>
      </section>
      
      <section>
        <h2>Children's Privacy</h2>
        <p>
          Our service is not intended for users under 16 years of age. We do not knowingly 
          collect information from children.
        </p>
      </section>
      
      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes 
          by posting the new policy on this page.
        </p>
      </section>
      
      <section>
        <h2>Legal Compliance</h2>
        <p>This app complies with:</p>
        <ul>
          <li>General Data Protection Regulation (GDPR)</li>
          <li>California Consumer Privacy Act (CCPA)</li>
          <li>Other applicable privacy laws</li>
        </ul>
      </section>
      
      <section class="contact">
        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us at:
        </p>
        <p>
          <a href="mailto:privacy@travelpathmanager.co.uk">privacy@travelpathmanager.co.uk</a>
        </p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString();
    }
  },
  mounted() {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }
}
</script>

<style scoped>
.privacy-policy {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  padding: 20px 0;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #db0007;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  font-size: 28px;
}

h2 {
  color: #292929;
  margin-top: 30px;
  font-size: 20px;
}

h3 {
  color: #292929;
  margin-top: 20px;
  font-size: 18px;
}

p {
  margin-bottom: 15px;
  font-size: 16px;
}

section {
  margin-bottom: 25px;
}

ul {
  margin-bottom: 20px;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

.last-updated {
  color: #666;
  font-style: italic;
  margin-bottom: 30px;
}

.contact {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
  margin-top: 40px;
}

a {
  color: #db0007;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 0 10px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 18px;
  }
  
  h3 {
    font-size: 16px;
  }
}
</style> 