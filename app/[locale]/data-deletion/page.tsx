export default async function DataDeletionPage() {
  return (
    <div className="container max-w-200 mx-auto px-6 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Data Deletion Instructions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: February 22, 2026
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <p className="text-muted-foreground leading-relaxed">
            At mtlmotoparking, we respect your privacy and give you full control
            over your data. If you wish to delete your account and all
            associated personal information, you can do so directly within the
            application.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">
            1. How to Delete Your Data
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To automatically delete your data and account from our servers,
            please follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2 text-muted-foreground">
            <li>
              <strong>Sign in</strong> to your account on mtlmotoparking.
            </li>
            <li>
              Open the main menu and navigate to the <strong>Settings</strong>{" "}
              page.
            </li>
            <li>
              Scroll down to the <strong>Delete Account</strong> section.
            </li>
            <li>
              Click the <strong>Delete</strong> button and confirm your choice.
            </li>
          </ol>
          <p className="mt-2 text-sm text-muted-foreground/80">
            Note: The deletion process is immediate and irreversible.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">
            2. What Gets Deleted?
          </h2>
          <ul className="flex flex-col gap-2 pl-6 list-disc text-muted-foreground">
            <li>
              <strong>User Profile:</strong> Your name, email address, profile
              picture, and authentication tokens provided by Google or Facebook.
            </li>
            <li>
              <strong>Contributions:</strong> Any fullness reports, comments,
              and text descriptions you have submitted.
            </li>
            <li>
              <strong>Photos:</strong> All images you have uploaded to parking
              spots (permanently removed from our image storage).
            </li>
            <li>
              <strong>Active Sessions:</strong> You will be immediately logged
              out of all active sessions.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">
            3. Manual Data Deletion Request
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you are unable to access your account or prefer that we handle
            the deletion for you, you can submit a manual data deletion request.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Please send an email to{" "}
            <a
              href="mailto:samuel-poulin@outlook.com"
              className="text-foreground hover:underline"
            >
              samuel-poulin@outlook.com
            </a>{" "}
            from the email address associated with your account. We will process
            your request and delete your data within 30 days.
          </p>
        </section>
      </div>
    </div>
  );
}