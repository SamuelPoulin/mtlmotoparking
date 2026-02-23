export default async function PrivacyPolicyPage() {
  return (
    <div className="container max-w-200 mx-auto px-6 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: February 22, 2026
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to mtlmotoparking. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you
            visit our website and use our application to find and contribute to
            motorcycle parking in Montreal.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">2. Information We Collect</h2>
          <ul className="flex flex-col gap-2 pl-6 list-disc text-muted-foreground">
            <li>
              <strong>Account Data:</strong> If you choose to log in to
              contribute, we collect your name, email address, and profile
              picture provided by your authentication provider (Google or
              Facebook).
            </li>
            <li>
              <strong>Contributions:</strong> Any photos, descriptions, and
              fullness levels you submit for parking spots are stored and
              associated with your account.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect anonymized interaction
              events (such as clicks and searches) to understand how the app is
              used and to improve the user experience.
            </li>
            <li>
              <strong>Session Data:</strong> We temporarily collect your IP
              address and browser user agent to maintain secure login sessions.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">3. How We Use Your Information</h2>
          <ul className="flex flex-col gap-2 pl-6 list-disc text-muted-foreground">
            <li>To provide, operate, and maintain the mtlmotoparking service.</li>
            <li>To securely authenticate you and manage your user session.</li>
            <li>
              To display your community contributions to other users of the
              application.
            </li>
            <li>
              To monitor and analyze usage patterns to improve the
              application&apos;s performance and features.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">4. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the following third-party services to operate the application,
            which may process your data according to their own privacy policies:
          </p>
          <ul className="flex flex-col gap-2 pl-6 list-disc text-muted-foreground">
            <li>
              <strong>Google & Facebook:</strong> For secure OAuth
              authentication.
            </li>
            <li>
              <strong>Cloudinary:</strong> For hosting and serving the photos you
              upload to parking spots.
            </li>
            <li>
              <strong>PostHog:</strong> For product analytics and usage tracking.
            </li>
            <li>
              <strong>Mapbox:</strong> For rendering the interactive map and
              providing address search functionality.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">5. Data Retention & Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your account information and contributions are retained as long as
            your account is active. You have the right to request the complete
            deletion of your personal data and all associated contributions at
            any time. This can be done directly and instantly from the Settings
            page within the application, or by contacting us.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">6. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            mtlmotoparking is maintained by an independent developer. If you have
            any questions about this Privacy Policy or your personal data,
            please contact:
          </p>
          <p className="font-medium text-foreground">
            <a
              href="mailto:samuel-poulin@outlook.com"
              className="hover:underline"
            >
              samuel-poulin@outlook.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
