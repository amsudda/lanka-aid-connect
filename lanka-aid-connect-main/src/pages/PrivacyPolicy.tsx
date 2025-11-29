import { PageLayout } from "@/components/layout/PageLayout";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <PageLayout title="Privacy Policy">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: November 2024</p>
            </div>
          </div>

          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Lanka Aid Connect, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform to connect those in need with generous donors across Sri Lanka.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Personal Information:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Name and contact details (phone number, WhatsApp number)</li>
                  <li>Location information (district, city, GPS coordinates if provided)</li>
                  <li>Profile information when you sign up via Google OAuth</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Need Post Information:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Details about the assistance you're requesting</li>
                  <li>Photos and voice notes you upload</li>
                  <li>Family composition details (number of adults, children, infants)</li>
                  <li>Group request information if applicable</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Technical Information:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and usage data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Connect people in need with potential donors</li>
              <li>Display your need posts publicly to facilitate community assistance</li>
              <li>Enable direct communication via WhatsApp</li>
              <li>Improve our platform's functionality and user experience</li>
              <li>Prevent fraud and ensure platform safety</li>
              <li>Send important updates about your posts and donations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Information Sharing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Public Information:</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create a need post, certain information becomes publicly visible, including your name, location (district and city), contact information, and post details. This is essential for donors to find and assist you.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">We Do Not:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Sell your personal information to third parties</li>
                  <li>Share your data with advertisers</li>
                  <li>Use your information for marketing purposes without consent</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Access, update, or delete your posts using the PIN provided when you created them</li>
              <li>Request removal of your personal information from our platform</li>
              <li>Withdraw consent for data processing at any time</li>
              <li>File a complaint if you believe your privacy rights have been violated</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Need posts remain active until marked as fulfilled or deleted by the creator. You can delete your posts at any time using your PIN.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Google OAuth:</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you sign up using Google, we receive basic profile information (name, email, profile picture) from Google. This data is used solely for authentication and profile creation. Please review Google's Privacy Policy for information on how they handle your data.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">WhatsApp:</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We provide WhatsApp links to facilitate direct communication between donors and requesters. WhatsApp communications are governed by WhatsApp's privacy policy, not ours.
                </p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to maintain your session, remember your preferences, and improve platform functionality. You can control cookie settings through your browser, though disabling cookies may limit some features.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify users of significant changes by posting a notice on our platform or through other appropriate communication channels.
            </p>
          </section>

          {/* Contact Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us through our platform or reach out to our support team.
            </p>
          </section>

          {/* Consent */}
          <section className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
            <h2 className="text-xl font-semibold text-foreground">Your Consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using Lanka Aid Connect, you consent to this Privacy Policy and agree to its terms. If you do not agree with this policy, please do not use our platform.
            </p>
          </section>

          {/* Footer note */}
          <div className="pt-6 text-center text-sm text-muted-foreground border-t border-border">
            <p>
              Thank you for trusting Lanka Aid Connect to make a difference in our community.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
