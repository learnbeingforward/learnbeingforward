/* Role menus — taken from the live portal's real menu structure.
   Each group = one top-menu item; its pages show as a sub-menu row.
   href paths are relative to the role folder. */
window.LBF_NAV = {
  'super-admin': {
    label: 'Super Admin', user: ['Lohit Kumar', 'Company admin'],
    groups: [
      { key: 'overview', label: 'Overview', icon: 'home', pages: [
        ['dashboard', 'Requests', 'dashboard.html'],
        ['notifications', 'Notifications', 'notifications.html'],
        ['attendance', 'Attendance', 'attendance.html'],
        ['edit-site', 'Edit Site', 'edit-site.html'],
        ['trainer-content', 'Trainer-Submitted Content', 'trainer-content.html']] },
      { key: 'accounts', label: 'Accounts', icon: 'users', pages: [
        ['add-account', 'Add Account', 'add-account.html'],
        ['manage-accounts', 'Manage Accounts', 'manage-accounts.html'],
        ['students', 'All Students', 'students.html'],
        ['buyers', 'Buyers', 'buyers.html'],
        ['colleges', 'Colleges', 'colleges.html'],
        ['trainers', 'Trainers', 'trainers.html'],
        ['account-details', 'Account Details', 'account-details.html'],
        ['employee-access', 'Employee Access', 'employee-access.html']] },
      { key: 'registrations', label: 'Registrations & Approvals', icon: 'clipboard', pages: [
        ['registrations', 'New Registrations', 'registrations.html'],
        ['attendance-approvals', 'Approvals from College', 'attendance-approvals.html'],
        ['password-resets', 'Password Reset Requests', 'password-resets.html']] },
      { key: 'assessments', label: 'Assessments', icon: 'code', pages: [
        ['assessments', 'Build & Send', 'assessments.html'],
        ['submissions', 'Submissions', 'assessment-submissions.html']] },
      { key: 'content', label: 'Course Content', icon: 'book', pages: [['course-content', 'Course Studio', 'course-content.html']] },
      { key: 'site-builder', label: 'Site Builder', icon: 'layers', pages: [['site-builder', 'Site Builder', 'site-builder.html']] },
      { key: 'profile', label: 'Profile', icon: 'user', pages: [['profile', 'Profile', 'profile.html']] }
    ]
  }
};
window.LBF_NAV['trainer'] = {
  label: 'Trainer', user: ['Demo Trainer', 'Backend Development'],
  groups: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home', pages: [['dashboard', 'Dashboard', 'dashboard.html']] },
    { key: 'details', label: 'Personal Details', icon: 'user', pages: [['details', 'Personal Details', 'details.html']] },
    { key: 'batches', label: 'My Batches', icon: 'users', pages: [['batches', 'My Batches', 'batches.html']] },
    { key: 'schedule', label: 'Schedule', icon: 'calendar', pages: [['schedule', 'Schedule', 'schedule.html']] },
    { key: 'attendance', label: 'Attendance', icon: 'check', pages: [['attendance', 'Attendance', 'attendance.html']] },
    { key: 'content', label: 'Content', icon: 'upload', pages: [['content', 'Content', 'content.html']] },
    { key: 'mou', label: 'MOU', icon: 'file', pages: [['mou', 'MOU', 'mou.html']] },
    { key: 'invoice', label: 'Invoice', icon: 'money', pages: [['invoice', 'Invoice', 'invoice.html']] }
  ]
};
window.LBF_NAV['college'] = {
  label: 'College', user: ['Crestview College of Engineering', 'College admin'],
  groups: [
    { key: 'overview', label: 'Overview', icon: 'home', pages: [['dashboard', 'Overview', 'dashboard.html']] },
    { key: 'students', label: 'Students', icon: 'users', pages: [['students', 'Browse by branch', 'students.html'], ['all-students', 'All students', 'all-students.html'], ['add-student', 'Add student', 'add-student.html']] },
    { key: 'courses', label: 'Courses', icon: 'book', pages: [['courses', 'Courses', 'courses.html']] },
    { key: 'batches', label: 'Batches', icon: 'layers', pages: [['batches', 'Batches', 'batches.html']] },
    { key: 'queries', label: 'Query from Student', icon: 'message', pages: [['queries', 'Query from Student', 'queries.html']] },
    { key: 'content-requests', label: 'Content Requests', icon: 'book', pages: [['content-requests', 'Content Requests', 'content-requests.html']] },
    { key: 'contracts', label: 'Contracts', icon: 'file', pages: [['contracts', 'Contracts', 'contracts.html']] },
    { key: 'assessment-data', label: 'Assessment Data', icon: 'chart', pages: [['assessment-data', 'Assessment Data', 'assessment-data.html']] },
    { key: 'profile', label: 'Profile', icon: 'user', pages: [['profile', 'Profile', 'profile.html']] }
  ]
};
window.LBF_NAV['student'] = {
  label: 'Student', user: ['Aadhya Joshi', 'Crestview College of Engineering'],
  groups: [
    { key: 'dashboard', label: 'My Dashboard', icon: 'home', pages: [['dashboard', 'My Dashboard', 'dashboard.html']] },
    { key: 'attendance', label: 'Attendance', icon: 'check', pages: [['attendance', 'Attendance', 'attendance.html']] },
    { key: 'courses', label: 'Browse Courses', icon: 'book', pages: [['courses', 'Browse Courses', 'courses.html']] },
    { key: 'content', label: 'Content', icon: 'file', pages: [['content', 'Content', 'content.html']] },
    { key: 'assessments', label: 'Assessments', icon: 'code', pages: [['assessments', 'Assessments', 'assessments.html']] },
    { key: 'profile', label: 'Profile', icon: 'user', pages: [['profile', 'Profile', 'profile.html']] }
  ]
};
/* Sub-pages that live under a menu page (keeps the parent highlighted) */
window.LBF_PARENT = {
  'edit-site-courses': 'edit-site', 'edit-site-buy': 'edit-site', 'edit-site-employees': 'edit-site',
  'colleges-approvals': 'colleges', 'colleges-sent': 'colleges', 'colleges-mous': 'colleges',
  'trainers-batches': 'trainers', 'trainers-batches-requests': 'trainers', 'trainers-batches-calendar': 'trainers', 'certificates': 'attendance', 'student-detail': 'students', 'contract-detail': 'contracts', 'assessment-builder': 'assessments', 'certificate-editor': 'trainers', 'college-invoice': 'colleges', 'invoice-detail': 'contracts', 'enrollment-detail': 'students', 'college-contract': 'colleges', 'trainer-sessions': 'trainers', 'trainer-invoice': 'trainers', 'attendance-college': 'attendance', 'attendance-batch': 'attendance', 'batch-admin': 'trainers', 'trainers-schedule': 'trainers', 'trainers-invoices': 'trainers',
  'assessment-create': 'assessments', 'mou-editor': 'colleges',
  'mark-attendance': 'attendance',
  'batch-detail': 'batches',
  'course-progress': 'dashboard'
};
