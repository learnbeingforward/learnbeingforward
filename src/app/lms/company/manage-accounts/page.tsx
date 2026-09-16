import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ResetAccountForm } from "@/components/lms/ResetAccountForm";

export default function CompanyManageAccountsPage() {
  return (
    <DashboardShell title="Manage Accounts" subtitle="Directly reset any account's password" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Use this to reset the login for a student, a college admin, or the company account itself —
        for example when someone is locked out and the request didn&apos;t come through the public
        forgot-password form. Look the account up by its exact email.
      </p>
      <ResetAccountForm />
    </DashboardShell>
  );
}
