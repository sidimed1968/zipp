import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiFilter,
  FiGlobe,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMoon,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiSun,
  FiTrash2,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Lang = 'fr' | 'ar';
type ThemeMode = 'light' | 'dark';
type ModuleKey = 'dashboard' | 'patients' | 'appointments' | 'records' | 'laboratory' | 'pharmacy' | 'billing' | 'users';
type DashboardRange = 'today' | 'week' | 'month';
type Gender = 'female' | 'male';
type PatientStatus = 'active' | 'followup' | 'urgent';
type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
type LabStatus = 'requested' | 'running' | 'completed';
type MedicationStatus = 'available' | 'low' | 'out';
type InvoiceStatus = 'paid' | 'pending' | 'partial';
type UserStatus = 'active' | 'suspended';
type RoleKey = 'admin' | 'doctor' | 'nurse' | 'lab' | 'pharmacy' | 'agent';
type DepartmentKey = 'administration' | 'care' | 'laboratory' | 'pharmacy' | 'finance' | 'reception';
type PermissionKey = 'patients' | 'appointments' | 'records' | 'laboratory' | 'pharmacy' | 'billing' | 'users';
type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  phone: string;
  email: string;
  allergies: string;
  history: string;
  status: PatientStatus;
};

type Appointment = {
  id: number;
  patientId: number;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  note: string;
};

type MedicalRecord = {
  id: number;
  patientId: number;
  doctor: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
};

type LabTest = {
  id: number;
  patientId: number;
  testName: string;
  date: string;
  status: LabStatus;
  result: string;
  urgent: boolean;
};

type Medication = {
  id: number;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
  supplier: string;
  expiryDate: string;
  status: MedicationStatus;
};

type Invoice = {
  id: number;
  patientId: number;
  date: string;
  amount: number;
  insurance: string;
  status: InvoiceStatus;
  description: string;
};

type UserAccount = {
  id: number;
  name: string;
  role: RoleKey;
  department: DepartmentKey;
  email: string;
  phone: string;
  status: UserStatus;
  twoFactor: boolean;
  lastLogin: string;
  permissions: PermissionKey[];
};

type RoleProfile = {
  id: number;
  role: RoleKey;
  title: string;
  description: string;
  defaultPermissions: PermissionKey[];
};

type AccessRequest = {
  id: number;
  name: string;
  email: string;
  role: RoleKey;
  department: DepartmentKey;
  status: AccessRequestStatus;
  requestedAt: string;
  note: string;
};

type AuditEntry = {
  id: number;
  actor: string;
  action: string;
  target: string;
  scope: string;
  timestamp: string;
};

type ToastState = {
  visible: boolean;
  message: string;
};

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  theme: ThemeMode;
};

const roleOptions: RoleKey[] = ['admin', 'doctor', 'nurse', 'lab', 'pharmacy', 'agent'];
const departmentOptions: DepartmentKey[] = ['administration', 'care', 'laboratory', 'pharmacy', 'finance', 'reception'];
const permissionOptions: PermissionKey[] = ['patients', 'appointments', 'records', 'laboratory', 'pharmacy', 'billing', 'users'];
const rangeOptions: DashboardRange[] = ['today', 'week', 'month'];
const today = new Date().toISOString().slice(0, 10);
const APP_STORAGE_VERSION = 'hc-v3';

function storageKey(key: string) {
  return `${APP_STORAGE_VERSION}-${key}`;
}

const TEXT = {
  fr: {
    appName: 'Hôpital Central',
    shortName: 'HC',
    acronym: 'SIGH',
    appTitle: 'Système de Gestion Hospitalière Intégré',
    interactiveDashboard: 'Tableau de bord interactif',
    dashboardDescription:
      'Vue dynamique des soins, du laboratoire, de la pharmacie, de la facturation en MRU et de la gestion avancée des utilisateurs.',
    login: {
      title: 'Connexion sécurisée',
      subtitle: 'Accédez à la plateforme clinique bilingue avec authentification simplifiée.',
      email: 'Adresse email',
      password: 'Mot de passe',
      remember: 'Se souvenir de moi',
      submit: 'Se connecter',
      helper: 'Démo : utilisez n’importe quel email et un mot de passe d’au moins 4 caractères.',
      welcome: 'Pilotage hospitalier moderne',
      feature1: 'Tableau de bord temps réel',
      feature2: 'Gestion complète des utilisateurs',
      feature3: 'Version bilingue Français / Arabe',
      feature4: 'Sécurité, 2FA et traçabilité',
      invalid: 'Veuillez saisir un email valide et un mot de passe correct.',
    },
    theme: {
      light: 'Clair',
      dark: 'Sombre',
      switch: 'Changer de thème',
    },
    modules: {
      dashboard: 'Tableau de bord',
      patients: 'Patients',
      appointments: 'Rendez-vous',
      records: 'Dossiers médicaux',
      laboratory: 'Laboratoire',
      pharmacy: 'Pharmacie',
      billing: 'Facturation',
      users: 'Utilisateurs',
    },
    actions: {
      addPatient: 'Ajouter un patient',
      addAppointment: 'Nouveau rendez-vous',
      addRecord: 'Nouveau dossier',
      addLab: 'Nouvelle analyse',
      addMedication: 'Ajouter un médicament',
      addInvoice: 'Nouvelle facture',
      addUser: 'Ajouter un utilisateur',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      search: 'Rechercher...',
      refresh: 'Actualiser',
      reset: 'Réinitialiser les données',
      quickActions: 'Actions rapides',
      manage: 'Gérer',
      resetPassword: 'Réinitialiser mot de passe',
      toggle2FA: 'Basculer 2FA',
      toggleStatus: 'Basculer statut',
      stockPlus: '+10 stock',
      stockMinus: '-1 stock',
      signOut: 'Déconnexion',
      close: 'Fermer',
      openModule: 'Ouvrir le module',
      demoAccess: 'Accès démo direct',
    },
    dashboard: {
      welcome: 'Pilotage temps réel des opérations hospitalières',
      today: "Aujourd'hui",
      week: '7 jours',
      month: '30 jours',
      period: 'Période',
      recentActivity: 'Activité récente',
      alerts: 'Alertes prioritaires',
      analytics: 'Analytique opérationnelle',
      statusSplit: 'Répartition des rendez-vous',
      moduleLoad: 'Charge par module',
      revenueTrend: 'Tendance des revenus',
      stockChart: 'État des stocks critiques',
      coverage: 'Sécurité des accès',
      noAlerts: 'Aucune alerte critique.',
      noRecent: 'Aucune activité récente.',
      clickToOpen: 'Cliquer pour ouvrir le module',
      overview: 'Vue d’ensemble hospitalière',
      resetHint: 'Remettre les données de démonstration à l’état initial',
      syncHint: 'Actualiser les indicateurs et les listes',
      revenueSummary: 'Résumé financier en MRU',
      userSecurity: 'Sécurité des comptes',
      medicationsOverview: 'Surveillance de la pharmacie',
      recordsCoverage: 'Suivi clinique et dossiers',
    },
    cards: {
      patients: 'Patients',
      appointments: 'Rendez-vous',
      revenue: 'Revenus',
      openLabs: 'Analyses ouvertes',
      lowStock: 'Stock critique',
      twoFactor: '2FA activée',
      activeUsers: 'Utilisateurs actifs',
      urgentPatients: 'Patients urgents',
    },
    moduleText: {
      patientsTitle: 'Gestion des patients',
      patientsSubtitle: 'CRUD complet des fiches, antécédents et états patients.',
      appointmentsTitle: 'Gestion des rendez-vous',
      appointmentsSubtitle: 'Planification, suivi de statut et organisation médicale.',
      recordsTitle: 'Dossiers médicaux',
      recordsSubtitle: 'Diagnostics, traitements, notes et historique clinique.',
      laboratoryTitle: 'Laboratoire',
      laboratorySubtitle: 'Demandes d’analyses, urgence et publication des résultats.',
      pharmacyTitle: 'Pharmacie',
      pharmacySubtitle: 'Inventaire, ruptures, stocks faibles et dates d’expiration.',
      billingTitle: 'Facturation & assurances',
      billingSubtitle: 'Suivi financier, règlements et assurances des patients.',
      usersTitle: 'Gestion des utilisateurs',
      usersSubtitle: 'Comptes, rôles, permissions, départements, sécurité et 2FA.',
    },
    labels: {
      firstName: 'Prénom',
      lastName: 'Nom',
      gender: 'Genre',
      age: 'Âge',
      phone: 'Téléphone',
      email: 'Email',
      allergies: 'Allergies',
      history: 'Antécédents médicaux',
      status: 'Statut',
      patient: 'Patient',
      doctor: 'Médecin',
      date: 'Date',
      time: 'Heure',
      type: 'Type',
      note: 'Note',
      diagnosis: 'Diagnostic',
      treatment: 'Traitement',
      notes: 'Notes',
      testName: 'Analyse',
      result: 'Résultat',
      urgent: 'Urgence',
      name: 'Nom',
      category: 'Catégorie',
      stock: 'Stock',
      unitPrice: 'Prix unitaire',
      supplier: 'Fournisseur',
      expiryDate: 'Date d’expiration',
      amount: 'Montant (MRU)',
      insurance: 'Assurance',
      description: 'Description',
      role: 'Rôle',
      department: 'Département',
      permissions: 'Permissions',
      twoFactor: '2FA',
      lastLogin: 'Dernière connexion',
      actions: 'Actions',
      search: 'Recherche',
      filters: 'Filtres',
      all: 'Tous',
      noData: 'Aucune donnée disponible.',
      unknownPatient: 'Patient inconnu',
      activeAccount: 'Compte actif',
      suspendedAccount: 'Compte suspendu',
      enabled: 'Activée',
      disabled: 'Désactivée',
      yes: 'Oui',
      no: 'Non',
      roleFilter: 'Filtre rôle',
      statusFilter: 'Filtre statut',
      expiringSoon: 'Expiration proche',
      outOfStock: 'Rupture',
      lowStock: 'Stock faible',
      total: 'Total',
      profile: 'Profil',
      clinicalOverview: 'Vue clinique',
      inventoryValue: 'Valeur du stock',
      pendingAmount: 'Montant en attente',
      onlineStatus: 'État du compte',
      language: 'Langue',
      theme: 'Thème',
    },
    options: {
      gender: { female: 'Femme', male: 'Homme' },
      patientStatus: { active: 'Actif', followup: 'Suivi', urgent: 'Urgence' },
      appointmentStatus: { scheduled: 'Planifié', completed: 'Terminé', cancelled: 'Annulé' },
      labStatus: { requested: 'Demandé', running: 'En cours', completed: 'Terminé' },
      medicationStatus: { available: 'Disponible', low: 'Stock faible', out: 'Rupture' },
      invoiceStatus: { paid: 'Payée', pending: 'En attente', partial: 'Partielle' },
      userStatus: { active: 'Actif', suspended: 'Suspendu' },
      role: {
        admin: 'Administrateur',
        doctor: 'Médecin',
        nurse: 'Infirmier',
        lab: 'Laborantin',
        pharmacy: 'Pharmacien',
        agent: 'Agent',
      },
      department: {
        administration: 'Administration',
        care: 'Soins',
        laboratory: 'Laboratoire',
        pharmacy: 'Pharmacie',
        finance: 'Finance',
        reception: 'Accueil',
      },
      permission: {
        patients: 'Patients',
        appointments: 'Rendez-vous',
        records: 'DME',
        laboratory: 'Laboratoire',
        pharmacy: 'Pharmacie',
        billing: 'Facturation',
        users: 'Utilisateurs',
      },
    },
    messages: {
      createSuccess: 'Enregistrement créé avec succès.',
      updateSuccess: 'Enregistrement mis à jour avec succès.',
      deleteSuccess: 'Enregistrement supprimé avec succès.',
      patientCascadeDelete: 'Patient et données liées supprimés avec succès.',
      syncSuccess: 'Indicateurs actualisés.',
      resetSuccess: 'Données de démonstration réinitialisées.',
      passwordReset: 'Lien de réinitialisation du mot de passe simulé.',
      requiredPatient: 'Veuillez créer un patient avant cette opération.',
      confirmDelete: 'Confirmer la suppression ?',
      loginSuccess: 'Connexion réussie.',
      logoutSuccess: 'Déconnexion réussie.',
      themeUpdated: 'Thème mis à jour.',
    },
  },
  ar: {
    appName: 'المستشفى المركزي',
    shortName: 'HC',
    acronym: 'SIGH',
    appTitle: 'نظام الإدارة الاستشفائية المتكامل',
    interactiveDashboard: 'لوحة قيادة تفاعلية',
    dashboardDescription:
      'عرض تفاعلي للرعاية الطبية والمختبر والصيدلية والفوترة بالأوقية الجديدة MRU وإدارة متقدمة للمستخدمين.',
    login: {
      title: 'تسجيل دخول آمن',
      subtitle: 'ولوج إلى المنصة الطبية الثنائية اللغة مع مصادقة مبسطة.',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      remember: 'تذكرني',
      submit: 'تسجيل الدخول',
      helper: 'نسخة تجريبية: استعمل أي بريد إلكتروني وكلمة مرور لا تقل عن 4 أحرف.',
      welcome: 'قيادة استشفائية عصرية',
      feature1: 'لوحة قيادة لحظية',
      feature2: 'إدارة شاملة للمستخدمين',
      feature3: 'نسخة ثنائية اللغة فرنسية / عربية',
      feature4: 'الأمن والمصادقة الثنائية والتتبع',
      invalid: 'يرجى إدخال بريد إلكتروني صالح وكلمة مرور صحيحة.',
    },
    theme: {
      light: 'فاتح',
      dark: 'داكن',
      switch: 'تبديل المظهر',
    },
    modules: {
      dashboard: 'لوحة القيادة',
      patients: 'المرضى',
      appointments: 'المواعيد',
      records: 'الملفات الطبية',
      laboratory: 'المختبر',
      pharmacy: 'الصيدلية',
      billing: 'الفوترة',
      users: 'المستخدمون',
    },
    actions: {
      addPatient: 'إضافة مريض',
      addAppointment: 'موعد جديد',
      addRecord: 'ملف جديد',
      addLab: 'تحليل جديد',
      addMedication: 'إضافة دواء',
      addInvoice: 'فاتورة جديدة',
      addUser: 'إضافة مستخدم',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      search: 'بحث...',
      refresh: 'تحديث',
      reset: 'إعادة تعيين البيانات',
      quickActions: 'إجراءات سريعة',
      manage: 'إدارة',
      resetPassword: 'إعادة تعيين كلمة المرور',
      toggle2FA: 'تبديل المصادقة الثنائية',
      toggleStatus: 'تبديل الحالة',
      stockPlus: 'زيادة 10',
      stockMinus: 'نقصان 1',
      signOut: 'تسجيل الخروج',
      close: 'إغلاق',
      openModule: 'فتح الوحدة',
      demoAccess: 'دخول تجريبي مباشر',
    },
    dashboard: {
      welcome: 'قيادة لحظية للعمليات الاستشفائية',
      today: 'اليوم',
      week: '7 أيام',
      month: '30 يوماً',
      period: 'الفترة',
      recentActivity: 'النشاط الأخير',
      alerts: 'تنبيهات ذات أولوية',
      analytics: 'تحليلات تشغيلية',
      statusSplit: 'توزيع المواعيد',
      moduleLoad: 'حمولة الوحدات',
      revenueTrend: 'اتجاه الإيرادات',
      stockChart: 'وضعية المخزون الحرج',
      coverage: 'أمن الوصول',
      noAlerts: 'لا توجد تنبيهات حرجة.',
      noRecent: 'لا يوجد نشاط حديث.',
      clickToOpen: 'اضغط لفتح الوحدة',
      overview: 'نظرة عامة على المستشفى',
      resetHint: 'إرجاع البيانات التجريبية إلى حالتها الأصلية',
      syncHint: 'تحديث المؤشرات والقوائم',
      revenueSummary: 'ملخص مالي بالأوقية الجديدة MRU',
      userSecurity: 'أمن الحسابات',
      medicationsOverview: 'مراقبة الصيدلية',
      recordsCoverage: 'متابعة سريرية وملفات طبية',
    },
    cards: {
      patients: 'المرضى',
      appointments: 'المواعيد',
      revenue: 'الإيرادات',
      openLabs: 'تحاليل مفتوحة',
      lowStock: 'مخزون حرج',
      twoFactor: 'المصادقة الثنائية',
      activeUsers: 'المستخدمون النشطون',
      urgentPatients: 'حالات استعجالية',
    },
    moduleText: {
      patientsTitle: 'إدارة المرضى',
      patientsSubtitle: 'عمليات CRUD كاملة لبطاقات المرضى والسوابق والحالات.',
      appointmentsTitle: 'إدارة المواعيد',
      appointmentsSubtitle: 'البرمجة والمتابعة وتنظيم النشاط الطبي.',
      recordsTitle: 'الملفات الطبية',
      recordsSubtitle: 'التشخيصات والعلاجات والملاحظات والسجل السريري.',
      laboratoryTitle: 'المختبر',
      laboratorySubtitle: 'طلبات التحاليل والحالات الاستعجالية ونشر النتائج.',
      pharmacyTitle: 'الصيدلية',
      pharmacySubtitle: 'الجرد والانقطاعات والمخزون الضعيف وتواريخ الانتهاء.',
      billingTitle: 'الفوترة والتأمين',
      billingSubtitle: 'المتابعة المالية والتسديدات وتأمين المرضى.',
      usersTitle: 'إدارة المستخدمين',
      usersSubtitle: 'الحسابات والأدوار والصلاحيات والأقسام والأمن والمصادقة الثنائية.',
    },
    labels: {
      firstName: 'الاسم',
      lastName: 'اللقب',
      gender: 'الجنس',
      age: 'العمر',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      allergies: 'الحساسيات',
      history: 'السوابق الطبية',
      status: 'الحالة',
      patient: 'المريض',
      doctor: 'الطبيب',
      date: 'التاريخ',
      time: 'الوقت',
      type: 'النوع',
      note: 'ملاحظة',
      diagnosis: 'التشخيص',
      treatment: 'العلاج',
      notes: 'الملاحظات',
      testName: 'التحليل',
      result: 'النتيجة',
      urgent: 'استعجالي',
      name: 'الاسم',
      category: 'الفئة',
      stock: 'المخزون',
      unitPrice: 'سعر الوحدة',
      supplier: 'المورد',
      expiryDate: 'تاريخ الانتهاء',
      amount: 'المبلغ (أوقية جديدة MRU)',
      insurance: 'التأمين',
      description: 'الوصف',
      role: 'الدور',
      department: 'القسم',
      permissions: 'الصلاحيات',
      twoFactor: 'المصادقة الثنائية',
      lastLogin: 'آخر دخول',
      actions: 'الإجراءات',
      search: 'بحث',
      filters: 'الفلاتر',
      all: 'الكل',
      noData: 'لا توجد بيانات متاحة.',
      unknownPatient: 'مريض غير معروف',
      activeAccount: 'حساب نشط',
      suspendedAccount: 'حساب موقوف',
      enabled: 'مفعلة',
      disabled: 'معطلة',
      yes: 'نعم',
      no: 'لا',
      roleFilter: 'فلتر الدور',
      statusFilter: 'فلتر الحالة',
      expiringSoon: 'قرب الانتهاء',
      outOfStock: 'نفاد المخزون',
      lowStock: 'مخزون ضعيف',
      total: 'الإجمالي',
      profile: 'الملف الشخصي',
      clinicalOverview: 'نظرة سريرية',
      inventoryValue: 'قيمة المخزون',
      pendingAmount: 'المبلغ المعلق',
      onlineStatus: 'حالة الحساب',
      language: 'اللغة',
      theme: 'المظهر',
    },
    options: {
      gender: { female: 'أنثى', male: 'ذكر' },
      patientStatus: { active: 'نشط', followup: 'متابعة', urgent: 'استعجال' },
      appointmentStatus: { scheduled: 'مبرمج', completed: 'مكتمل', cancelled: 'ملغى' },
      labStatus: { requested: 'مطلوب', running: 'قيد الإنجاز', completed: 'مكتمل' },
      medicationStatus: { available: 'متوفر', low: 'مخزون ضعيف', out: 'نفاد' },
      invoiceStatus: { paid: 'مدفوعة', pending: 'قيد الانتظار', partial: 'جزئية' },
      userStatus: { active: 'نشط', suspended: 'موقوف' },
      role: {
        admin: 'مسؤول',
        doctor: 'طبيب',
        nurse: 'ممرض',
        lab: 'مخبري',
        pharmacy: 'صيدلي',
        agent: 'عون',
      },
      department: {
        administration: 'الإدارة',
        care: 'العلاج',
        laboratory: 'المختبر',
        pharmacy: 'الصيدلية',
        finance: 'المالية',
        reception: 'الاستقبال',
      },
      permission: {
        patients: 'المرضى',
        appointments: 'المواعيد',
        records: 'الملفات الطبية',
        laboratory: 'المختبر',
        pharmacy: 'الصيدلية',
        billing: 'الفوترة',
        users: 'المستخدمون',
      },
    },
    messages: {
      createSuccess: 'تم إنشاء السجل بنجاح.',
      updateSuccess: 'تم تحديث السجل بنجاح.',
      deleteSuccess: 'تم حذف السجل بنجاح.',
      patientCascadeDelete: 'تم حذف المريض وكل البيانات المرتبطة به.',
      syncSuccess: 'تم تحديث المؤشرات.',
      resetSuccess: 'تمت إعادة تعيين البيانات التجريبية.',
      passwordReset: 'تمت محاكاة إرسال رابط إعادة تعيين كلمة المرور.',
      requiredPatient: 'يرجى إنشاء مريض أولاً قبل هذه العملية.',
      confirmDelete: 'تأكيد الحذف؟',
      loginSuccess: 'تم تسجيل الدخول بنجاح.',
      logoutSuccess: 'تم تسجيل الخروج بنجاح.',
      themeUpdated: 'تم تحديث المظهر.',
    },
  },
} as const;

function addDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

function createSeed() {
  const patients: Patient[] = [
    {
      id: 1,
      firstName: 'Amina',
      lastName: 'Benali',
      gender: 'female',
      age: 41,
      phone: '06 11 22 33 44',
      email: 'amina.benali@patient.test',
      allergies: 'Pénicilline',
      history: 'Hypertension artérielle',
      status: 'active',
    },
    {
      id: 2,
      firstName: 'Youssef',
      lastName: 'Khaldi',
      gender: 'male',
      age: 29,
      phone: '06 55 66 77 88',
      email: 'youssef.khaldi@patient.test',
      allergies: 'Aucune',
      history: 'Asthme léger',
      status: 'followup',
    },
    {
      id: 3,
      firstName: 'Salma',
      lastName: 'Rahmani',
      gender: 'female',
      age: 35,
      phone: '07 99 00 11 22',
      email: 'salma.rahmani@patient.test',
      allergies: 'Latex',
      history: 'Diabète type 1',
      status: 'urgent',
    },
  ];

  const appointments: Appointment[] = [
    {
      id: 1,
      patientId: 1,
      doctor: 'Dr. Bernard',
      date: today,
      time: '09:30',
      type: 'Consultation',
      status: 'scheduled',
      note: 'Contrôle tensionnel',
    },
    {
      id: 2,
      patientId: 2,
      doctor: 'Dr. Sara',
      date: addDays(1),
      time: '11:00',
      type: 'Suivi',
      status: 'scheduled',
      note: 'Suivi respiratoire',
    },
    {
      id: 3,
      patientId: 3,
      doctor: 'Dr. Mourad',
      date: addDays(-1),
      time: '15:00',
      type: 'Urgence différée',
      status: 'completed',
      note: 'Contrôle glycémie',
    },
  ];

  const records: MedicalRecord[] = [
    {
      id: 1,
      patientId: 1,
      doctor: 'Dr. Bernard',
      date: today,
      diagnosis: 'Hypertension contrôlée',
      treatment: 'Lisinopril 10mg',
      notes: 'Contrôle dans 30 jours.',
    },
    {
      id: 2,
      patientId: 3,
      doctor: 'Dr. Mourad',
      date: addDays(-1),
      diagnosis: 'Diabète stable',
      treatment: 'Insuline rapide',
      notes: 'Suivi alimentation et glycémie.',
    },
  ];

  const labTests: LabTest[] = [
    {
      id: 1,
      patientId: 1,
      testName: 'Hémogramme complet',
      date: today,
      status: 'requested',
      result: '',
      urgent: false,
    },
    {
      id: 2,
      patientId: 3,
      testName: 'Glycémie',
      date: today,
      status: 'running',
      result: '',
      urgent: true,
    },
  ];

  const medications: Medication[] = [
    {
      id: 1,
      name: 'Paracétamol 500mg',
      category: 'Antalgique',
      stock: 120,
      unitPrice: 85,
      supplier: 'PharmaPlus',
      expiryDate: addDays(300),
      status: 'available',
    },
    {
      id: 2,
      name: 'Amoxicilline 1g',
      category: 'Antibiotique',
      stock: 8,
      unitPrice: 240,
      supplier: 'MediStock',
      expiryDate: addDays(30),
      status: 'low',
    },
    {
      id: 3,
      name: 'Insuline rapide',
      category: 'Hormone',
      stock: 0,
      unitPrice: 550,
      supplier: 'BioCare',
      expiryDate: addDays(100),
      status: 'out',
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 1,
      patientId: 1,
      date: today,
      amount: 4500,
      insurance: 'CNAM',
      status: 'pending',
      description: 'Consultation cardiologie + bilan',
    },
    {
      id: 2,
      patientId: 2,
      date: addDays(-2),
      amount: 1800,
      insurance: 'Axa Santé',
      status: 'paid',
      description: 'Consultation générale',
    },
    {
      id: 3,
      patientId: 3,
      date: addDays(-6),
      amount: 3200,
      insurance: 'CNSS',
      status: 'partial',
      description: 'Suivi diabétologie',
    },
  ];

  const users: UserAccount[] = [
    {
      id: 1,
      name: 'Amina Kader',
      role: 'admin',
      department: 'administration',
      email: 'admin@hopital-central.test',
      phone: '06 10 10 10 10',
      status: 'active',
      twoFactor: true,
      lastLogin: new Date().toISOString(),
      permissions: ['patients', 'appointments', 'records', 'laboratory', 'pharmacy', 'billing', 'users'],
    },
    {
      id: 2,
      name: 'Dr. Bernard',
      role: 'doctor',
      department: 'care',
      email: 'bernard@hopital-central.test',
      phone: '06 22 22 22 22',
      status: 'active',
      twoFactor: true,
      lastLogin: new Date(Date.now() - 3600 * 1000).toISOString(),
      permissions: ['patients', 'appointments', 'records', 'laboratory'],
    },
    {
      id: 3,
      name: 'Nadia Salem',
      role: 'pharmacy',
      department: 'pharmacy',
      email: 'pharmacie@hopital-central.test',
      phone: '06 33 33 33 33',
      status: 'suspended',
      twoFactor: false,
      lastLogin: new Date(Date.now() - 86400 * 1000).toISOString(),
      permissions: ['pharmacy', 'patients'],
    },
  ];

  const roleProfiles: RoleProfile[] = [
    {
      id: 1,
      role: 'admin',
      title: 'Supervision globale',
      description: 'Gouvernance, securite, parametres et administration centrale.',
      defaultPermissions: ['patients', 'appointments', 'records', 'laboratory', 'pharmacy', 'billing', 'users'],
    },
    {
      id: 2,
      role: 'doctor',
      title: 'Praticien clinique',
      description: 'Consultation, prescriptions, suivi medical et coordination des analyses.',
      defaultPermissions: ['patients', 'appointments', 'records', 'laboratory'],
    },
    {
      id: 3,
      role: 'pharmacy',
      title: 'Gestion pharmacie',
      description: 'Inventaire, delivrance, controle des lots et alertes de stock.',
      defaultPermissions: ['patients', 'pharmacy'],
    },
  ];

  const accessRequests: AccessRequest[] = [
    {
      id: 1,
      name: 'Meryem El Hacen',
      email: 'meryem.elhacen@hopital-central.test',
      role: 'nurse',
      department: 'care',
      status: 'pending',
      requestedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      note: 'Affectation au service de medecine interne.',
    },
    {
      id: 2,
      name: 'Ibrahim Ould Ahmed',
      email: 'ibrahim.ahmed@hopital-central.test',
      role: 'lab',
      department: 'laboratory',
      status: 'approved',
      requestedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      note: 'Besoin d acces au workflow de validation des analyses.',
    },
  ];

  const auditEntries: AuditEntry[] = [
    {
      id: 1,
      actor: 'Amina Kader',
      action: 'Activation 2FA',
      target: 'Dr. Bernard',
      scope: 'Utilisateurs',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      actor: 'Systeme',
      action: 'Alerte stock faible',
      target: 'Amoxicilline 1g',
      scope: 'Pharmacie',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: 3,
      actor: 'Amina Kader',
      action: 'Creation de compte',
      target: 'Meryem El Hacen',
      scope: 'Utilisateurs',
      timestamp: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    },
  ];

  return { patients, appointments, records, labTests, medications, invoices, users, roleProfiles, accessRequests, auditEntries };
}

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    const raw = window.localStorage.getItem(key);
    if (!raw) return initialValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function nextId(items: Array<{ id: number }>) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function getPatientName(patientId: number, patients: Patient[], lang: Lang) {
  const patient = patients.find((item) => item.id === patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : TEXT[lang].labels.unknownPatient;
}

function computeMedicationStatus(stock: number): MedicationStatus {
  if (stock <= 0) return 'out';
  if (stock <= 10) return 'low';
  return 'available';
}

function isWithinRange(date: string, range: DashboardRange) {
  const target = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = target.getTime() - startOfToday.getTime();
  const days = diff / 86400000;
  if (range === 'today') return date === today;
  if (range === 'week') return days >= -6 && days <= 6;
  return days >= -30 && days <= 30;
}

function formatMoney(amount: number, lang: Lang) {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-MR' : 'ar-MR', {
    style: 'currency',
    currency: 'MRU',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateValue(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'ar-MR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function formatDateTime(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'ar-MR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function statusTone(status: string, theme: ThemeMode) {
  const dark = theme === 'dark';
  switch (status) {
    case 'active':
    case 'completed':
    case 'available':
    case 'paid':
      return dark ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20' : 'bg-emerald-100 text-emerald-700';
    case 'urgent':
    case 'cancelled':
    case 'out':
    case 'suspended':
      return dark ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/20' : 'bg-red-100 text-red-700';
    case 'low':
    case 'pending':
    case 'partial':
    case 'running':
    case 'requested':
      return dark ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20' : 'bg-amber-100 text-amber-700';
    default:
      return dark ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20' : 'bg-blue-100 text-blue-700';
  }
}

function pageShell(theme: ThemeMode) {
  return theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';
}

function surface(theme: ThemeMode) {
  return theme === 'dark'
    ? 'border border-white/10 bg-slate-900/80 text-slate-100 shadow-2xl shadow-black/20 backdrop-blur'
    : 'border border-slate-200 bg-white text-slate-900 shadow-sm';
}

function muted(theme: ThemeMode) {
  return theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
}

function fieldClass(theme: ThemeMode) {
  return theme === 'dark'
    ? 'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
    : 'w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500';
}

function tableHead(theme: ThemeMode) {
  return theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600';
}

function tableRow(theme: ThemeMode) {
  return theme === 'dark' ? 'border-t border-white/10' : 'border-t border-slate-100';
}

function chartPalette(theme: ThemeMode) {
  return theme === 'dark'
    ? ['#38bdf8', '#818cf8', '#22c55e', '#f59e0b', '#f43f5e', '#14b8a6']
    : ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
}

function hospitalLogo(theme: ThemeMode) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 shadow-lg shadow-blue-500/25">
      <div className="absolute h-7 w-7 rounded-xl border border-white/20 bg-white/10 backdrop-blur" />
      <div className="relative flex h-7 w-7 items-center justify-center text-white">
        <div className="absolute h-4 w-1.5 rounded-full bg-white" />
        <div className="absolute h-1.5 w-4 rounded-full bg-white" />
        <FiActivity className={`absolute h-6 w-6 ${theme === 'dark' ? 'text-cyan-100/70' : 'text-white/60'}`} />
      </div>
    </div>
  );
}

function Modal({ open, title, onClose, children, theme }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-4xl rounded-3xl ${surface(theme)}`}>
        <div className={`flex items-center justify-between border-b px-6 py-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className={`rounded-xl p-2 transition ${theme === 'dark' ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function Toast({ toast, theme }: { toast: ToastState; theme: ThemeMode }) {
  if (!toast.visible) return null;
  return (
    <div className={`fixed end-4 top-4 z-[60] rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${theme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
      {toast.message}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
  tone = 'blue',
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  onClick?: () => void;
  tone?: 'blue' | 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';
}) {
  const palette = {
    blue: 'from-blue-600 via-indigo-600 to-sky-500',
    cyan: 'from-cyan-600 via-sky-600 to-blue-500',
    emerald: 'from-emerald-600 via-teal-600 to-cyan-500',
    violet: 'from-violet-600 via-fuchsia-600 to-indigo-500',
    amber: 'from-amber-500 via-orange-500 to-rose-500',
    rose: 'from-rose-500 via-pink-600 to-violet-600',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br ${palette} p-5 text-left shadow-lg transition ${
        onClick ? 'hover:-translate-y-1 hover:shadow-2xl' : 'hover:shadow-xl'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%)]" />
      <div className="absolute -end-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          <p className="mt-1 text-sm text-white/80">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white/20 p-3 text-white shadow-lg">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-xs font-semibold text-white/90">
        <span className="inline-flex h-2 w-2 rounded-full bg-white" />
        {subtitle}
      </div>
    </button>
  );
}

function SectionTitle({ title, subtitle, action, theme }: { title: string; subtitle: string; action?: React.ReactNode; theme: ThemeMode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className={`text-sm ${muted(theme)}`}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder, theme }: { value: string; onChange: (value: string) => void; placeholder: string; theme: ThemeMode }) {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch className={`pointer-events-none absolute start-3 top-3.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${fieldClass(theme)} pe-4 ps-10`} />
    </div>
  );
}

function ToolbarCard({ children, theme }: { children: React.ReactNode; theme: ThemeMode }) {
  return <div className={`rounded-3xl p-4 ${surface(theme)}`}>{children}</div>;
}

function EmptyState({ text, theme }: { text: string; theme: ThemeMode }) {
  return (
    <div className={`rounded-3xl border border-dashed p-10 text-center text-sm ${theme === 'dark' ? 'border-white/15 bg-slate-900/60 text-slate-400' : 'border-slate-300 bg-white text-slate-500'}`}>
      {text}
    </div>
  );
}

function labelGender(lang: Lang, gender: Gender) {
  return TEXT[lang].options.gender[gender];
}
function labelPatientStatus(lang: Lang, status: PatientStatus) {
  return TEXT[lang].options.patientStatus[status];
}
function labelAppointmentStatus(lang: Lang, status: AppointmentStatus) {
  return TEXT[lang].options.appointmentStatus[status];
}
function labelLabStatus(lang: Lang, status: LabStatus) {
  return TEXT[lang].options.labStatus[status];
}
function labelMedicationStatus(lang: Lang, status: MedicationStatus) {
  return TEXT[lang].options.medicationStatus[status];
}
function labelInvoiceStatus(lang: Lang, status: InvoiceStatus) {
  return TEXT[lang].options.invoiceStatus[status];
}
function labelUserStatus(lang: Lang, status: UserStatus) {
  return TEXT[lang].options.userStatus[status];
}
function labelRole(lang: Lang, role: RoleKey) {
  return TEXT[lang].options.role[role];
}
function labelDepartment(lang: Lang, department: DepartmentKey) {
  return TEXT[lang].options.department[department];
}
function labelPermission(lang: Lang, permission: PermissionKey) {
  return TEXT[lang].options.permission[permission];
}

function labelAccessRequestStatus(lang: Lang, status: AccessRequestStatus) {
  const labels = {
    fr: {
      pending: 'En attente',
      approved: 'Approuvee',
      rejected: 'Refusee',
    },
    ar: {
      pending: 'قيد الانتظار',
      approved: 'مقبولة',
      rejected: 'مرفوضة',
    },
  };

  return labels[lang][status];
}

function accessRequestTone(status: AccessRequestStatus, theme: ThemeMode) {
  const dark = theme === 'dark';

  switch (status) {
    case 'approved':
      return dark ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20' : 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return dark ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/20' : 'bg-red-100 text-red-700';
    default:
      return dark ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20' : 'bg-amber-100 text-amber-700';
  }
}

function DashboardView({
  lang,
  theme,
  patients,
  appointments,
  records,
  labTests,
  medications,
  users,
  invoices,
  roleProfiles,
  accessRequests,
  auditEntries,
  onNavigate,
  onSync,
  onReset,
}: {
  lang: Lang;
  theme: ThemeMode;
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  labTests: LabTest[];
  medications: Medication[];
  users: UserAccount[];
  invoices: Invoice[];
  roleProfiles: RoleProfile[];
  accessRequests: AccessRequest[];
  auditEntries: AuditEntry[];
  onNavigate: (module: ModuleKey) => void;
  onSync: () => void;
  onReset: () => void;
}) {
  const text = TEXT[lang];
  const [range, setRange] = useState<DashboardRange>('week');
  const palette = chartPalette(theme);
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(148,163,184,0.12)' : '#e2e8f0';

  const filteredAppointments = appointments.filter((item) => isWithinRange(item.date, range));
  const filteredInvoices = invoices.filter((item) => isWithinRange(item.date, range));
  const filteredLabs = labTests.filter((item) => isWithinRange(item.date, range));

  const revenue = filteredInvoices.reduce((sum, item) => sum + item.amount, 0);
  const openLabs = filteredLabs.filter((item) => item.status !== 'completed').length;
  const lowStock = medications.filter((item) => item.stock <= 10).length;
  const activeUsers = users.filter((item) => item.status === 'active').length;
  const urgentPatients = patients.filter((item) => item.status === 'urgent').length;
  const enabled2FA = users.filter((item) => item.twoFactor).length;
  const inventoryValue = medications.reduce((sum, item) => sum + item.unitPrice * item.stock, 0);
  const pendingAmount = invoices.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + item.amount, 0);
  const pendingAccessRequests = accessRequests.filter((item) => item.status === 'pending').length;
  const recentAuditEntries = [...auditEntries].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 3);

  const recentAppointments = [...appointments]
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5);

  const appointmentStatusData = [
    { name: labelAppointmentStatus(lang, 'scheduled'), count: filteredAppointments.filter((item) => item.status === 'scheduled').length },
    { name: labelAppointmentStatus(lang, 'completed'), count: filteredAppointments.filter((item) => item.status === 'completed').length },
    { name: labelAppointmentStatus(lang, 'cancelled'), count: filteredAppointments.filter((item) => item.status === 'cancelled').length },
  ];

  const moduleLoad = [
    { name: text.modules.patients, count: patients.length },
    { name: text.modules.appointments, count: appointments.length },
    { name: text.modules.records, count: records.length },
    { name: text.modules.laboratory, count: labTests.length },
    { name: text.modules.pharmacy, count: medications.length },
    { name: text.modules.users, count: users.length },
  ];

  const revenueTrend = [
    { name: range === 'today' ? text.dashboard.today : 'J-6', value: invoices.filter((item) => isWithinRange(item.date, 'week') && item.date === addDays(-6)).reduce((s, i) => s + i.amount, 0) },
    { name: 'J-4', value: invoices.filter((item) => item.date === addDays(-4)).reduce((s, i) => s + i.amount, 0) },
    { name: 'J-2', value: invoices.filter((item) => item.date === addDays(-2)).reduce((s, i) => s + i.amount, 0) },
    { name: text.dashboard.today, value: invoices.filter((item) => item.date === today).reduce((s, i) => s + i.amount, 0) },
  ];

  const pharmacyChart = medications.map((item) => ({ name: item.name.split(' ')[0], stock: item.stock }));

  const alerts = [
    lowStock > 0 ? `${lowStock} ${text.cards.lowStock.toLowerCase()}` : '',
    openLabs > 0 ? `${openLabs} ${text.cards.openLabs.toLowerCase()}` : '',
    users.filter((item) => item.status === 'suspended').length > 0
      ? `${users.filter((item) => item.status === 'suspended').length} ${text.labels.suspendedAccount.toLowerCase()}`
      : '',
    urgentPatients > 0 ? `${urgentPatients} ${text.cards.urgentPatients.toLowerCase()}` : '',
    pendingAccessRequests > 0
      ? `${pendingAccessRequests} ${lang === 'fr' ? 'demandes d acces en attente' : 'طلبات وصول قيد الانتظار'}`
      : '',
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 shadow-cyan-950/40' : 'bg-gradient-to-br from-sky-600 via-blue-700 to-violet-700 shadow-blue-200/60'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.25),transparent_28%)]" />
        <div className="absolute -top-16 end-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -bottom-12 start-16 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-100 backdrop-blur">
              <FiActivity className="h-4 w-4" />
              {text.appName}
            </div>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">{text.interactiveDashboard}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">{text.dashboardDescription}</p>
            <p className="mt-4 text-sm font-medium text-white/90">{text.dashboard.welcome}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/12 px-4 py-4 backdrop-blur">
                <div className="text-xs text-blue-100">{text.cards.patients}</div>
                <div className="mt-2 text-2xl font-bold text-white">{patients.length}</div>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-4 backdrop-blur">
                <div className="text-xs text-blue-100">{text.cards.revenue}</div>
                <div className="mt-2 text-2xl font-bold text-white">{formatMoney(revenue, lang)}</div>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-4 backdrop-blur">
                <div className="text-xs text-blue-100">{text.cards.openLabs}</div>
                <div className="mt-2 text-2xl font-bold text-white">{openLabs}</div>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-4 backdrop-blur">
                <div className="text-xs text-blue-100">{text.labels.inventoryValue}</div>
                <div className="mt-2 text-2xl font-bold text-white">{formatMoney(inventoryValue, lang)}</div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:w-[30rem]">
            {[['patients', text.actions.addPatient], ['appointments', text.actions.addAppointment], ['pharmacy', text.modules.pharmacy], ['users', text.modules.users]].map(([module, label]) => (
              <button
                key={module}
                onClick={() => onNavigate(module as ModuleKey)}
                className="rounded-2xl border border-white/15 bg-white/15 px-4 py-4 text-start backdrop-blur transition hover:bg-white/25"
              >
                <div className="font-semibold">{label}</div>
                <div className="mt-1 text-sm text-blue-100">{text.dashboard.clickToOpen}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium ${theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
              <FiFilter className="h-4 w-4" />
              {text.dashboard.period}
            </div>
            {rangeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  range === option
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                      ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {text.dashboard[option]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onSync} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200 hover:bg-white/10' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              <FiRefreshCw className="h-4 w-4" />
              {text.actions.refresh}
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-2 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/15">
              <FiAlertTriangle className="h-4 w-4" />
              {text.actions.reset}
            </button>
          </div>
        </div>
      </ToolbarCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title={text.cards.patients} value={String(patients.length)} subtitle={text.modules.patients} icon={FiUsers} tone="blue" onClick={() => onNavigate('patients')} />
        <MetricCard title={text.cards.appointments} value={String(filteredAppointments.length)} subtitle={text.modules.appointments} icon={FiCalendar} tone="cyan" onClick={() => onNavigate('appointments')} />
        <MetricCard title={text.cards.revenue} value={formatMoney(revenue, lang)} subtitle={text.modules.billing} icon={FiCreditCard} tone="emerald" onClick={() => onNavigate('billing')} />
        <MetricCard title={text.cards.openLabs} value={String(openLabs)} subtitle={text.modules.laboratory} icon={FiActivity} tone="violet" onClick={() => onNavigate('laboratory')} />
        <MetricCard title={text.cards.lowStock} value={String(lowStock)} subtitle={text.modules.pharmacy} icon={FiPackage} tone="amber" onClick={() => onNavigate('pharmacy')} />
        <MetricCard title={text.cards.twoFactor} value={`${enabled2FA}/${users.length}`} subtitle={text.dashboard.coverage} icon={FiShield} tone="rose" onClick={() => onNavigate('users')} />
        <MetricCard title={text.cards.activeUsers} value={String(activeUsers)} subtitle={text.modules.users} icon={FiUser} tone="blue" onClick={() => onNavigate('users')} />
        <MetricCard title={text.cards.urgentPatients} value={String(urgentPatients)} subtitle={text.modules.patients} icon={FiBell} tone="amber" onClick={() => onNavigate('patients')} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className={`rounded-3xl p-5 xl:col-span-2 ${surface(theme)}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{text.dashboard.recentActivity}</h2>
            <button onClick={() => onNavigate('appointments')} className="text-sm font-semibold text-blue-500 hover:text-blue-400">
              {text.actions.manage}
            </button>
          </div>
          <div className="space-y-3">
            {recentAppointments.map((item) => (
              <div key={item.id} className={`flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-slate-200'}`}>
                <div>
                  <p className="font-semibold">{getPatientName(item.patientId, patients, lang)}</p>
                  <p className={`text-sm ${muted(theme)}`}>{item.doctor} • {item.type}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-2 text-sm ${muted(theme)}`}>
                    <FiClock className="h-4 w-4" />
                    {formatDateValue(item.date, lang)} • {item.time}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status, theme)}`}>
                    {labelAppointmentStatus(lang, item.status)}
                  </span>
                </div>
              </div>
            ))}
            {!recentAppointments.length && <p className={`text-sm ${muted(theme)}`}>{text.dashboard.noRecent}</p>}
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${surface(theme)}`}>
          <h2 className="text-lg font-semibold">{text.dashboard.alerts}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {alerts.map((alert, index) => (
              <div key={`${alert}-${index}`} className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-700'}`}>
                {alert}
              </div>
            ))}
            {!alerts.length && <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>{text.dashboard.noAlerts}</div>}
          </div>

          <div className={`mt-5 rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className="text-sm font-semibold">{text.dashboard.userSecurity}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className={`text-xs ${muted(theme)}`}>{text.cards.twoFactor}</div>
                <div className="mt-1 text-lg font-bold">{enabled2FA}/{users.length}</div>
              </div>
              <div>
                <div className={`text-xs ${muted(theme)}`}>{text.labels.pendingAmount}</div>
                <div className="mt-1 text-lg font-bold">{formatMoney(pendingAmount, lang)}</div>
              </div>
              <div>
                <div className={`text-xs ${muted(theme)}`}>{lang === 'fr' ? 'Profils d acces' : 'ملفات الوصول'}</div>
                <div className="mt-1 text-lg font-bold">{roleProfiles.length}</div>
              </div>
              <div>
                <div className={`text-xs ${muted(theme)}`}>{lang === 'fr' ? 'Demandes en attente' : 'طلبات معلقة'}</div>
                <div className="mt-1 text-lg font-bold">{pendingAccessRequests}</div>
              </div>
            </div>

            <div className={`mt-4 rounded-2xl p-4 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-white'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{lang === 'fr' ? 'Journal d audit recent' : 'سجل التدقيق الأخير'}</p>
                <span className={`text-xs ${muted(theme)}`}>{auditEntries.length} {lang === 'fr' ? 'entrees' : 'إدخالات'}</span>
              </div>
              <div className="mt-3 space-y-3">
                {recentAuditEntries.map((entry) => (
                  <div key={entry.id} className={`flex items-start justify-between gap-3 rounded-2xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div>
                      <p className="text-sm font-semibold">{entry.action}</p>
                      <p className={`text-xs ${muted(theme)}`}>{entry.actor} • {entry.target} • {entry.scope}</p>
                    </div>
                    <span className={`text-xs ${muted(theme)}`}>{formatDateTime(entry.timestamp, lang)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`rounded-[1.75rem] p-5 ${surface(theme)}`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-200">
              <FiTrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">{text.dashboard.revenueTrend}</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: 16,
                    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={palette[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-[1.75rem] p-5 ${surface(theme)}`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-violet-600 p-2 text-white shadow-lg shadow-violet-200">
              <FiCalendar className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">{text.dashboard.statusSplit}</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={appointmentStatusData} dataKey="count" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: 16,
                    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`rounded-[1.75rem] p-5 ${surface(theme)}`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-200">
              <FiHome className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">{text.dashboard.moduleLoad}</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleLoad} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" stroke={axisColor} />
                <YAxis type="category" dataKey="name" stroke={axisColor} width={110} />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: 16,
                    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
                  }}
                />
                <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                  {moduleLoad.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-[1.75rem] p-5 ${surface(theme)}`}>
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-2xl bg-amber-500 p-2 text-white shadow-lg shadow-amber-200">
              <FiPackage className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">{text.dashboard.stockChart}</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pharmacyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: 16,
                    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
                  }}
                />
                <Bar dataKey="stock" radius={[10, 10, 0, 0]}>
                  {pharmacyChart.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientsView({ lang, theme, patients, setPatients, onDeleteCascade, notify }: { lang: Lang; theme: ThemeMode; patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>>; onDeleteCascade: (id: number) => void; notify: (message: string) => void; }) {
  const text = TEXT[lang];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Patient, 'id'>>({ firstName: '', lastName: '', gender: 'female', age: 18, phone: '', email: '', allergies: '', history: '', status: 'active' });

  const filtered = patients.filter((item) => {
    const matchesQuery = `${item.firstName} ${item.lastName} ${item.email} ${item.phone} ${item.history}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ firstName: '', lastName: '', gender: 'female', age: 18, phone: '', email: '', allergies: '', history: '', status: 'active' });
    setOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setForm({ firstName: patient.firstName, lastName: patient.lastName, gender: patient.gender, age: patient.age, phone: patient.phone, email: patient.email, allergies: patient.allergies, history: patient.history, status: patient.status });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) return;
    if (editingId !== null) {
      setPatients((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
      notify(text.messages.updateSuccess);
    } else {
      setPatients((current) => [...current, { id: nextId(current), ...form }]);
      notify(text.messages.createSuccess);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (window.confirm(text.messages.confirmDelete)) onDeleteCascade(id);
  };

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.patientsTitle} subtitle={text.moduleText.patientsSubtitle} action={<button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addPatient}</button>} />
      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | PatientStatus)} className={fieldClass(theme)}>
            <option value="all">{text.labels.all}</option>
            <option value="active">{labelPatientStatus(lang, 'active')}</option>
            <option value="followup">{labelPatientStatus(lang, 'followup')}</option>
            <option value="urgent">{labelPatientStatus(lang, 'urgent')}</option>
          </select>
        </div>
      </ToolbarCard>

      <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={tableHead(theme)}>
              <tr>
                <th className="px-4 py-3 text-start">{text.labels.name}</th>
                <th className="px-4 py-3 text-start">{text.labels.age}</th>
                <th className="px-4 py-3 text-start">{text.labels.phone}</th>
                <th className="px-4 py-3 text-start">{text.labels.allergies}</th>
                <th className="px-4 py-3 text-start">{text.labels.status}</th>
                <th className="px-4 py-3 text-end">{text.labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id} className={tableRow(theme)}>
                  <td className="px-4 py-3"><div className="font-semibold">{patient.firstName} {patient.lastName}</div><div className={muted(theme)}>{patient.email || '-'}</div></td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{patient.age} • {labelGender(lang, patient.gender)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{patient.phone}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{patient.allergies || '-'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(patient.status, theme)}`}>{labelPatientStatus(lang, patient.status)}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(patient)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button><button onClick={() => remove(patient.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button></div></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title={editingId ? text.actions.edit : text.actions.addPatient} onClose={() => setOpen(false)} theme={theme}>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.firstName}</span><input className={fieldClass(theme)} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.lastName}</span><input className={fieldClass(theme)} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.gender}</span><select className={fieldClass(theme)} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}><option value="female">{labelGender(lang, 'female')}</option><option value="male">{labelGender(lang, 'male')}</option></select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.age}</span><input type="number" min={0} className={fieldClass(theme)} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.phone}</span><input className={fieldClass(theme)} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.email}</span><input type="email" className={fieldClass(theme)} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.allergies}</span><input className={fieldClass(theme)} value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.status}</span><select className={fieldClass(theme)} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PatientStatus })}><option value="active">{labelPatientStatus(lang, 'active')}</option><option value="followup">{labelPatientStatus(lang, 'followup')}</option><option value="urgent">{labelPatientStatus(lang, 'urgent')}</option></select></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.history}</span><textarea rows={4} className={fieldClass(theme)} value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function AppointmentsView({ lang, theme, patients, appointments, setAppointments, notify }: { lang: Lang; theme: ThemeMode; patients: Patient[]; appointments: Appointment[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; notify: (message: string) => void; }) {
  const text = TEXT[lang];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Appointment, 'id'>>({ patientId: patients[0]?.id ?? 0, doctor: '', date: today, time: '09:00', type: 'Consultation', status: 'scheduled', note: '' });

  const filtered = appointments.filter((item) => {
    const matchesQuery = `${getPatientName(item.patientId, patients, lang)} ${item.doctor} ${item.type} ${item.note}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const openCreate = () => {
    if (!patients.length) return notify(text.messages.requiredPatient);
    setEditingId(null);
    setForm({ patientId: patients[0].id, doctor: '', date: today, time: '09:00', type: 'Consultation', status: 'scheduled', note: '' });
    setOpen(true);
  };

  const openEdit = (item: Appointment) => {
    setEditingId(item.id);
    setForm({ patientId: item.patientId, doctor: item.doctor, date: item.date, time: item.time, type: item.type, status: item.status, note: item.note });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctor || !form.date || !form.time) return;
    if (editingId !== null) {
      setAppointments((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
      notify(text.messages.updateSuccess);
    } else {
      setAppointments((current) => [...current, { id: nextId(current), ...form }]);
      notify(text.messages.createSuccess);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (window.confirm(text.messages.confirmDelete)) {
      setAppointments((current) => current.filter((item) => item.id !== id));
      notify(text.messages.deleteSuccess);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.appointmentsTitle} subtitle={text.moduleText.appointmentsSubtitle} action={<button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addAppointment}</button>} />
      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | AppointmentStatus)} className={fieldClass(theme)}>
            <option value="all">{text.labels.all}</option>
            <option value="scheduled">{labelAppointmentStatus(lang, 'scheduled')}</option>
            <option value="completed">{labelAppointmentStatus(lang, 'completed')}</option>
            <option value="cancelled">{labelAppointmentStatus(lang, 'cancelled')}</option>
          </select>
        </div>
      </ToolbarCard>
      <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={tableHead(theme)}><tr><th className="px-4 py-3 text-start">{text.labels.patient}</th><th className="px-4 py-3 text-start">{text.labels.doctor}</th><th className="px-4 py-3 text-start">{text.labels.date}</th><th className="px-4 py-3 text-start">{text.labels.time}</th><th className="px-4 py-3 text-start">{text.labels.type}</th><th className="px-4 py-3 text-start">{text.labels.status}</th><th className="px-4 py-3 text-end">{text.labels.actions}</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={tableRow(theme)}>
                  <td className="px-4 py-3 font-medium">{getPatientName(item.patientId, patients, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.doctor}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{formatDateValue(item.date, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.time}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.type}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status, theme)}`}>{labelAppointmentStatus(lang, item.status)}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button><button onClick={() => remove(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button></div></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editingId ? text.actions.edit : text.actions.addAppointment} onClose={() => setOpen(false)} theme={theme}>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.patient}</span><select className={fieldClass(theme)} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.doctor}</span><input className={fieldClass(theme)} value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.date}</span><input type="date" className={fieldClass(theme)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.time}</span><input type="time" className={fieldClass(theme)} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.type}</span><input className={fieldClass(theme)} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.status}</span><select className={fieldClass(theme)} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}><option value="scheduled">{labelAppointmentStatus(lang, 'scheduled')}</option><option value="completed">{labelAppointmentStatus(lang, 'completed')}</option><option value="cancelled">{labelAppointmentStatus(lang, 'cancelled')}</option></select></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.note}</span><textarea rows={4} className={fieldClass(theme)} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function RecordsView({ lang, theme, patients, records, setRecords, notify }: { lang: Lang; theme: ThemeMode; patients: Patient[]; records: MedicalRecord[]; setRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>; notify: (message: string) => void; }) {
  const text = TEXT[lang];
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<MedicalRecord, 'id'>>({ patientId: patients[0]?.id ?? 0, doctor: '', date: today, diagnosis: '', treatment: '', notes: '' });

  const filtered = records.filter((item) => `${getPatientName(item.patientId, patients, lang)} ${item.doctor} ${item.diagnosis} ${item.treatment} ${item.notes}`.toLowerCase().includes(query.toLowerCase()));

  const openCreate = () => {
    if (!patients.length) return notify(text.messages.requiredPatient);
    setEditingId(null);
    setForm({ patientId: patients[0].id, doctor: '', date: today, diagnosis: '', treatment: '', notes: '' });
    setOpen(true);
  };

  const openEdit = (item: MedicalRecord) => {
    setEditingId(item.id);
    setForm({ patientId: item.patientId, doctor: item.doctor, date: item.date, diagnosis: item.diagnosis, treatment: item.treatment, notes: item.notes });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctor || !form.diagnosis) return;
    if (editingId !== null) {
      setRecords((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
      notify(text.messages.updateSuccess);
    } else {
      setRecords((current) => [...current, { id: nextId(current), ...form }]);
      notify(text.messages.createSuccess);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (window.confirm(text.messages.confirmDelete)) {
      setRecords((current) => current.filter((item) => item.id !== id));
      notify(text.messages.deleteSuccess);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.recordsTitle} subtitle={text.moduleText.recordsSubtitle} action={<button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addRecord}</button>} />
      <ToolbarCard theme={theme}><SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} /></ToolbarCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.id} className={`rounded-3xl p-5 ${surface(theme)}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{getPatientName(item.patientId, patients, lang)}</h3>
                <p className={`text-sm ${muted(theme)}`}>{item.doctor} • {formatDateValue(item.date, lang)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button>
                <button onClick={() => remove(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div><p className="font-semibold">{text.labels.diagnosis}</p><p className={muted(theme)}>{item.diagnosis}</p></div>
              <div><p className="font-semibold">{text.labels.treatment}</p><p className={muted(theme)}>{item.treatment || '-'}</p></div>
              <div><p className="font-semibold">{text.labels.notes}</p><p className={muted(theme)}>{item.notes || '-'}</p></div>
            </div>
          </div>
        ))}
        {!filtered.length && <div className="lg:col-span-2"><EmptyState text={text.labels.noData} theme={theme} /></div>}
      </div>
      <Modal open={open} title={editingId ? text.actions.edit : text.actions.addRecord} onClose={() => setOpen(false)} theme={theme}>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.patient}</span><select className={fieldClass(theme)} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.doctor}</span><input className={fieldClass(theme)} value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.date}</span><input type="date" className={fieldClass(theme)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.diagnosis}</span><input className={fieldClass(theme)} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.treatment}</span><input className={fieldClass(theme)} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.notes}</span><textarea rows={4} className={fieldClass(theme)} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function LaboratoryView({ lang, theme, patients, labTests, setLabTests, notify }: { lang: Lang; theme: ThemeMode; patients: Patient[]; labTests: LabTest[]; setLabTests: React.Dispatch<React.SetStateAction<LabTest[]>>; notify: (message: string) => void; }) {
  const text = TEXT[lang];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LabStatus>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<LabTest, 'id'>>({ patientId: patients[0]?.id ?? 0, testName: '', date: today, status: 'requested', result: '', urgent: false });

  const filtered = labTests.filter((item) => {
    const matchesQuery = `${getPatientName(item.patientId, patients, lang)} ${item.testName} ${item.result}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesUrgent = !urgentOnly || item.urgent;
    return matchesQuery && matchesStatus && matchesUrgent;
  });

  const openCreate = () => {
    if (!patients.length) return notify(text.messages.requiredPatient);
    setEditingId(null);
    setForm({ patientId: patients[0].id, testName: '', date: today, status: 'requested', result: '', urgent: false });
    setOpen(true);
  };

  const openEdit = (item: LabTest) => {
    setEditingId(item.id);
    setForm({ patientId: item.patientId, testName: item.testName, date: item.date, status: item.status, result: item.result, urgent: item.urgent });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.testName) return;
    if (editingId !== null) {
      setLabTests((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
      notify(text.messages.updateSuccess);
    } else {
      setLabTests((current) => [...current, { id: nextId(current), ...form }]);
      notify(text.messages.createSuccess);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (window.confirm(text.messages.confirmDelete)) {
      setLabTests((current) => current.filter((item) => item.id !== id));
      notify(text.messages.deleteSuccess);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.laboratoryTitle} subtitle={text.moduleText.laboratorySubtitle} action={<button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addLab}</button>} />
      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} />
          <div className="flex flex-wrap gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | LabStatus)} className={fieldClass(theme)}>
              <option value="all">{text.labels.all}</option>
              <option value="requested">{labelLabStatus(lang, 'requested')}</option>
              <option value="running">{labelLabStatus(lang, 'running')}</option>
              <option value="completed">{labelLabStatus(lang, 'completed')}</option>
            </select>
            <label className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}><input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} />{text.labels.urgent}</label>
          </div>
        </div>
      </ToolbarCard>
      <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={tableHead(theme)}><tr><th className="px-4 py-3 text-start">{text.labels.patient}</th><th className="px-4 py-3 text-start">{text.labels.testName}</th><th className="px-4 py-3 text-start">{text.labels.date}</th><th className="px-4 py-3 text-start">{text.labels.status}</th><th className="px-4 py-3 text-start">{text.labels.urgent}</th><th className="px-4 py-3 text-start">{text.labels.result}</th><th className="px-4 py-3 text-end">{text.labels.actions}</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={tableRow(theme)}>
                  <td className="px-4 py-3 font-medium">{getPatientName(item.patientId, patients, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.testName}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{formatDateValue(item.date, lang)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status, theme)}`}>{labelLabStatus(lang, item.status)}</span></td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.urgent ? text.labels.yes : text.labels.no}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.result || '-'}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button><button onClick={() => remove(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button></div></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editingId ? text.actions.edit : text.actions.addLab} onClose={() => setOpen(false)} theme={theme}>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.patient}</span><select className={fieldClass(theme)} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.testName}</span><input className={fieldClass(theme)} value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.date}</span><input type="date" className={fieldClass(theme)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.status}</span><select className={fieldClass(theme)} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LabStatus })}><option value="requested">{labelLabStatus(lang, 'requested')}</option><option value="running">{labelLabStatus(lang, 'running')}</option><option value="completed">{labelLabStatus(lang, 'completed')}</option></select></label>
          <label className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm md:col-span-2 ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}><input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} />{text.labels.urgent}</label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.result}</span><textarea rows={4} className={fieldClass(theme)} value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function PharmacyView({ lang, theme, medications, setMedications, notify }: { lang: Lang; theme: ThemeMode; medications: Medication[]; setMedications: React.Dispatch<React.SetStateAction<Medication[]>>; notify: (message: string) => void; }) {
  const text = TEXT[lang];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MedicationStatus>('all');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Medication, 'id'>>({ name: '', category: '', stock: 0, unitPrice: 0, supplier: '', expiryDate: today, status: 'available' });

  const expiringSoon = medications.filter((item) => new Date(item.expiryDate).getTime() - Date.now() <= 45 * 86400000).length;
  const inventoryValue = medications.reduce((sum, item) => sum + item.stock * item.unitPrice, 0);

  const filtered = medications.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.supplier}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', category: '', stock: 0, unitPrice: 0, supplier: '', expiryDate: today, status: 'available' });
    setOpen(true);
  };

  const openEdit = (item: Medication) => {
    setEditingId(item.id);
    setForm({ name: item.name, category: item.category, stock: item.stock, unitPrice: item.unitPrice, supplier: item.supplier, expiryDate: item.expiryDate, status: item.status });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    const payload = { ...form, status: computeMedicationStatus(form.stock) };
    if (editingId !== null) {
      setMedications((current) => current.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
      notify(text.messages.updateSuccess);
    } else {
      setMedications((current) => [...current, { id: nextId(current), ...payload }]);
      notify(text.messages.createSuccess);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (window.confirm(text.messages.confirmDelete)) {
      setMedications((current) => current.filter((item) => item.id !== id));
      notify(text.messages.deleteSuccess);
    }
  };

  const adjustStock = (id: number, delta: number) => {
    setMedications((current) => current.map((item) => item.id !== id ? item : { ...item, stock: Math.max(0, item.stock + delta), status: computeMedicationStatus(Math.max(0, item.stock + delta)) }));
    notify(text.messages.updateSuccess);
  };

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.pharmacyTitle} subtitle={text.moduleText.pharmacySubtitle} action={<button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addMedication}</button>} />
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard title={text.labels.total} value={String(medications.length)} subtitle={text.modules.pharmacy} icon={FiPackage} />
        <MetricCard title={text.labels.lowStock} value={String(medications.filter((item) => item.status === 'low').length)} subtitle={text.labels.lowStock} icon={FiAlertTriangle} />
        <MetricCard title={text.labels.outOfStock} value={String(medications.filter((item) => item.status === 'out').length)} subtitle={text.labels.outOfStock} icon={FiBell} />
        <MetricCard title={text.labels.expiringSoon} value={String(expiringSoon)} subtitle={text.labels.expiringSoon} icon={FiClock} />
        <MetricCard title={text.labels.inventoryValue} value={formatMoney(inventoryValue, lang)} subtitle={text.dashboard.medicationsOverview} icon={FiTrendingUp} />
      </div>
      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | MedicationStatus)} className={fieldClass(theme)}>
            <option value="all">{text.labels.all}</option>
            <option value="available">{labelMedicationStatus(lang, 'available')}</option>
            <option value="low">{labelMedicationStatus(lang, 'low')}</option>
            <option value="out">{labelMedicationStatus(lang, 'out')}</option>
          </select>
        </div>
      </ToolbarCard>
      <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={tableHead(theme)}><tr><th className="px-4 py-3 text-start">{text.labels.name}</th><th className="px-4 py-3 text-start">{text.labels.category}</th><th className="px-4 py-3 text-start">{text.labels.stock}</th><th className="px-4 py-3 text-start">{text.labels.unitPrice}</th><th className="px-4 py-3 text-start">{text.labels.supplier}</th><th className="px-4 py-3 text-start">{text.labels.expiryDate}</th><th className="px-4 py-3 text-start">{text.labels.status}</th><th className="px-4 py-3 text-end">{text.labels.actions}</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={tableRow(theme)}>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.category}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.stock}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{formatMoney(item.unitPrice, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.supplier}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{formatDateValue(item.expiryDate, lang)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status, theme)}`}>{labelMedicationStatus(lang, item.status)}</span></td>
                  <td className="px-4 py-3"><div className="flex flex-wrap justify-end gap-2"><button onClick={() => adjustStock(item.id, 10)} className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">{text.actions.stockPlus}</button><button onClick={() => adjustStock(item.id, -1)} className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400">{text.actions.stockMinus}</button><button onClick={() => openEdit(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button><button onClick={() => remove(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button></div></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={8} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editingId ? text.actions.edit : text.actions.addMedication} onClose={() => setOpen(false)} theme={theme}>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.name}</span><input className={fieldClass(theme)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.category}</span><input className={fieldClass(theme)} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.supplier}</span><input className={fieldClass(theme)} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.stock}</span><input type="number" min={0} className={fieldClass(theme)} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.unitPrice}</span><input type="number" min={0} step="0.01" className={fieldClass(theme)} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} required /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.expiryDate}</span><input type="date" className={fieldClass(theme)} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function BillingView({ lang, theme, patients, invoices, setInvoices, notify }: { lang: Lang; theme: ThemeMode; patients: Patient[]; invoices: Invoice[]; setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>; notify: (message: string) => void; }) {
  const text = TEXT[lang];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Invoice, 'id'>>({ patientId: patients[0]?.id ?? 0, date: today, amount: 0, insurance: '', status: 'pending', description: '' });

  const filtered = invoices.filter((item) => {
    const matchesQuery = `${getPatientName(item.patientId, patients, lang)} ${item.insurance} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalRevenue = invoices.reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = invoices.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + item.amount, 0);

  const openCreate = () => {
    if (!patients.length) return notify(text.messages.requiredPatient);
    setEditingId(null);
    setForm({ patientId: patients[0].id, date: today, amount: 0, insurance: '', status: 'pending', description: '' });
    setOpen(true);
  };

  const openEdit = (item: Invoice) => {
    setEditingId(item.id);
    setForm({ patientId: item.patientId, date: item.date, amount: item.amount, insurance: item.insurance, status: item.status, description: item.description });
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) return;
    if (editingId !== null) {
      setInvoices((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
      notify(text.messages.updateSuccess);
    } else {
      setInvoices((current) => [...current, { id: nextId(current), ...form }]);
      notify(text.messages.createSuccess);
    }
    setOpen(false);
  };

  const remove = (id: number) => {
    if (window.confirm(text.messages.confirmDelete)) {
      setInvoices((current) => current.filter((item) => item.id !== id));
      notify(text.messages.deleteSuccess);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.billingTitle} subtitle={text.moduleText.billingSubtitle} action={<button onClick={openCreate} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addInvoice}</button>} />
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title={text.cards.revenue} value={formatMoney(totalRevenue, lang)} subtitle={text.dashboard.revenueSummary} icon={FiCreditCard} />
        <MetricCard title={text.options.invoiceStatus.pending} value={formatMoney(pendingAmount, lang)} subtitle={text.labels.pendingAmount} icon={FiClock} />
      </div>
      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)} className={fieldClass(theme)}>
            <option value="all">{text.labels.all}</option>
            <option value="pending">{labelInvoiceStatus(lang, 'pending')}</option>
            <option value="partial">{labelInvoiceStatus(lang, 'partial')}</option>
            <option value="paid">{labelInvoiceStatus(lang, 'paid')}</option>
          </select>
        </div>
      </ToolbarCard>
      <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={tableHead(theme)}><tr><th className="px-4 py-3 text-start">{text.labels.patient}</th><th className="px-4 py-3 text-start">{text.labels.date}</th><th className="px-4 py-3 text-start">{text.labels.amount}</th><th className="px-4 py-3 text-start">{text.labels.insurance}</th><th className="px-4 py-3 text-start">{text.labels.status}</th><th className="px-4 py-3 text-start">{text.labels.description}</th><th className="px-4 py-3 text-end">{text.labels.actions}</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={tableRow(theme)}>
                  <td className="px-4 py-3 font-medium">{getPatientName(item.patientId, patients, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{formatDateValue(item.date, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{formatMoney(item.amount, lang)}</td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.insurance || '-'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status, theme)}`}>{labelInvoiceStatus(lang, item.status)}</span></td>
                  <td className={`px-4 py-3 ${muted(theme)}`}>{item.description}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button><button onClick={() => remove(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button></div></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editingId ? text.actions.edit : text.actions.addInvoice} onClose={() => setOpen(false)} theme={theme}>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.patient}</span><select className={fieldClass(theme)} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.date}</span><input type="date" className={fieldClass(theme)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.amount}</span><input type="number" min={0} step="0.01" className={fieldClass(theme)} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.insurance}</span><input className={fieldClass(theme)} value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.status}</span><select className={fieldClass(theme)} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}><option value="pending">{labelInvoiceStatus(lang, 'pending')}</option><option value="partial">{labelInvoiceStatus(lang, 'partial')}</option><option value="paid">{labelInvoiceStatus(lang, 'paid')}</option></select></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.description}</span><textarea rows={4} className={fieldClass(theme)} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function UsersView({
  lang,
  theme,
  users,
  setUsers,
  roleProfiles,
  setRoleProfiles,
  accessRequests,
  setAccessRequests,
  auditEntries,
  setAuditEntries,
  notify,
}: {
  lang: Lang;
  theme: ThemeMode;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  roleProfiles: RoleProfile[];
  setRoleProfiles: React.Dispatch<React.SetStateAction<RoleProfile[]>>;
  accessRequests: AccessRequest[];
  setAccessRequests: React.Dispatch<React.SetStateAction<AccessRequest[]>>;
  auditEntries: AuditEntry[];
  setAuditEntries: React.Dispatch<React.SetStateAction<AuditEntry[]>>;
  notify: (message: string) => void;
}) {
  const text = TEXT[lang];
  const ui = lang === 'fr'
    ? {
        tabs: {
          accounts: 'Comptes',
          profiles: 'Profils d acces',
          requests: 'Demandes d acces',
          audit: 'Journal d audit',
        },
        subtitle: 'Gestion des comptes, des profils de droits, des validations d acces et de la tracabilite.',
        profilesTitle: 'Profils de role',
        profilesSubtitle: 'Modeles de permissions reutilisables pour chaque role hospitalier.',
        requestsTitle: 'Demandes d acces',
        requestsSubtitle: 'Validation des nouvelles demandes et creation de comptes depuis les workflows d acces.',
        auditTitle: 'Journal d audit',
        auditSubtitle: 'Historique recent des operations sensibles et des changements utilisateurs.',
        addProfile: 'Ajouter un profil',
        addRequest: 'Nouvelle demande',
        requestStatus: 'Statut de demande',
        note: 'Commentaire',
        actor: 'Acteur',
        target: 'Cible',
        scope: 'Portee',
        applyTemplate: 'Appliquer le profil',
        approve: 'Approuver',
        reject: 'Refuser',
        staffCoverage: 'Couverture staff',
        pendingRequests: 'Demandes en attente',
        auditStream: 'Flux d audit',
        automaticProvisioning: 'Provisioning automatique si la demande est approuvee',
      }
    : {
        tabs: {
          accounts: 'الحسابات',
          profiles: 'ملفات الوصول',
          requests: 'طلبات الوصول',
          audit: 'سجل التدقيق',
        },
        subtitle: 'إدارة الحسابات وملفات الصلاحيات والموافقات على الوصول وتتبع العمليات.',
        profilesTitle: 'ملفات الأدوار',
        profilesSubtitle: 'قوالب صلاحيات قابلة لإعادة الاستخدام لكل دور داخل المستشفى.',
        requestsTitle: 'طلبات الوصول',
        requestsSubtitle: 'مراجعة الطلبات الجديدة وإنشاء الحسابات انطلاقا من دورة الموافقة.',
        auditTitle: 'سجل التدقيق',
        auditSubtitle: 'سجل حديث للعمليات الحساسة وتغييرات المستخدمين.',
        addProfile: 'إضافة ملف',
        addRequest: 'طلب جديد',
        requestStatus: 'حالة الطلب',
        note: 'ملاحظة',
        actor: 'الفاعل',
        target: 'الهدف',
        scope: 'النطاق',
        applyTemplate: 'تطبيق الملف',
        approve: 'موافقة',
        reject: 'رفض',
        staffCoverage: 'تغطية الطاقم',
        pendingRequests: 'طلبات معلقة',
        auditStream: 'تدفق التدقيق',
        automaticProvisioning: 'إنشاء الحساب تلقائيا عند الموافقة على الطلب',
      };

  const [activeTab, setActiveTab] = useState<'accounts' | 'profiles' | 'requests' | 'audit'>('accounts');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | RoleKey>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus | AccessRequestStatus>('all');
  const [userOpen, setUserOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState<Omit<UserAccount, 'id' | 'lastLogin'>>({
    name: '',
    role: 'doctor',
    department: 'care',
    email: '',
    phone: '',
    status: 'active',
    twoFactor: false,
    permissions: ['patients', 'appointments', 'records'],
  });
  const [profileForm, setProfileForm] = useState<Omit<RoleProfile, 'id'>>({
    role: 'doctor',
    title: '',
    description: '',
    defaultPermissions: ['patients', 'appointments', 'records'],
  });
  const [requestForm, setRequestForm] = useState<Omit<AccessRequest, 'id' | 'requestedAt'>>({
    name: '',
    email: '',
    role: 'nurse',
    department: 'care',
    status: 'pending',
    note: '',
  });

  const filteredUsers = users.filter((item) => {
    const matchesQuery = `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const filteredProfiles = roleProfiles.filter((item) => {
    const matchesQuery = `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const filteredRequests = accessRequests.filter((item) => {
    const matchesQuery = `${item.name} ${item.email} ${item.note}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const filteredAudit = auditEntries.filter((item) => `${item.actor} ${item.action} ${item.target} ${item.scope}`.toLowerCase().includes(query.toLowerCase()));

  const addAudit = (action: string, target: string, scope: string) => {
    setAuditEntries((current) => [
      {
        id: nextId(current),
        actor: 'Hôpital Central',
        action,
        target,
        scope,
        timestamp: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 80));
  };

  const getTemplatePermissions = (role: RoleKey) => roleProfiles.find((item) => item.role === role)?.defaultPermissions ?? ['patients'];

  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm({ name: '', role: 'doctor', department: 'care', email: '', phone: '', status: 'active', twoFactor: false, permissions: getTemplatePermissions('doctor') });
    setUserOpen(true);
  };

  const openEditUser = (item: UserAccount) => {
    setEditingUserId(item.id);
    setUserForm({ ...item, permissions: [...item.permissions] });
    setUserOpen(true);
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    if (editingUserId !== null) {
      setUsers((current) => current.map((item) => (item.id === editingUserId ? { ...item, ...userForm } : item)));
      addAudit(lang === 'fr' ? 'Mise a jour utilisateur' : 'تحديث مستخدم', userForm.name, text.modules.users);
      notify(text.messages.updateSuccess);
    } else {
      setUsers((current) => [...current, { id: nextId(current), lastLogin: new Date().toISOString(), ...userForm }]);
      addAudit(lang === 'fr' ? 'Creation utilisateur' : 'إنشاء مستخدم', userForm.name, text.modules.users);
      notify(text.messages.createSuccess);
    }

    setUserOpen(false);
  };

  const removeUser = (id: number) => {
    const target = users.find((item) => item.id === id);
    if (!target) return;
    if (window.confirm(text.messages.confirmDelete)) {
      setUsers((current) => current.filter((item) => item.id !== id));
      addAudit(lang === 'fr' ? 'Suppression utilisateur' : 'حذف مستخدم', target.name, text.modules.users);
      notify(text.messages.deleteSuccess);
    }
  };

  const toggleUserStatus = (id: number) => {
    const target = users.find((item) => item.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    setUsers((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
    addAudit(lang === 'fr' ? 'Changement de statut' : 'تغيير حالة', target.name, text.modules.users);
    notify(text.messages.updateSuccess);
  };

  const toggle2FA = (id: number) => {
    const target = users.find((item) => item.id === id);
    if (!target) return;
    setUsers((current) => current.map((item) => (item.id === id ? { ...item, twoFactor: !item.twoFactor } : item)));
    addAudit(lang === 'fr' ? 'Mise a jour 2FA' : 'تحديث المصادقة الثنائية', target.name, text.modules.users);
    notify(text.messages.updateSuccess);
  };

  const resetPassword = (item: UserAccount) => {
    addAudit(lang === 'fr' ? 'Reinitialisation mot de passe' : 'إعادة تعيين كلمة المرور', item.name, text.modules.users);
    notify(text.messages.passwordReset);
  };

  const toggleUserPermission = (permission: PermissionKey) => {
    setUserForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const openCreateProfile = () => {
    setEditingProfileId(null);
    setProfileForm({ role: 'doctor', title: '', description: '', defaultPermissions: getTemplatePermissions('doctor') });
    setProfileOpen(true);
  };

  const openEditProfile = (item: RoleProfile) => {
    setEditingProfileId(item.id);
    setProfileForm({ role: item.role, title: item.title, description: item.description, defaultPermissions: [...item.defaultPermissions] });
    setProfileOpen(true);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.title) return;

    if (editingProfileId !== null) {
      setRoleProfiles((current) => current.map((item) => (item.id === editingProfileId ? { id: editingProfileId, ...profileForm } : item)));
      addAudit(lang === 'fr' ? 'Mise a jour profil d acces' : 'تحديث ملف وصول', profileForm.title, ui.tabs.profiles);
      notify(text.messages.updateSuccess);
    } else {
      setRoleProfiles((current) => [...current, { id: nextId(current), ...profileForm }]);
      addAudit(lang === 'fr' ? 'Creation profil d acces' : 'إنشاء ملف وصول', profileForm.title, ui.tabs.profiles);
      notify(text.messages.createSuccess);
    }

    setProfileOpen(false);
  };

  const removeProfile = (id: number) => {
    const target = roleProfiles.find((item) => item.id === id);
    if (!target) return;
    if (window.confirm(text.messages.confirmDelete)) {
      setRoleProfiles((current) => current.filter((item) => item.id !== id));
      addAudit(lang === 'fr' ? 'Suppression profil d acces' : 'حذف ملف وصول', target.title, ui.tabs.profiles);
      notify(text.messages.deleteSuccess);
    }
  };

  const toggleProfilePermission = (permission: PermissionKey) => {
    setProfileForm((current) => ({
      ...current,
      defaultPermissions: current.defaultPermissions.includes(permission)
        ? current.defaultPermissions.filter((item) => item !== permission)
        : [...current.defaultPermissions, permission],
    }));
  };

  const openCreateRequest = () => {
    setEditingRequestId(null);
    setRequestForm({ name: '', email: '', role: 'nurse', department: 'care', status: 'pending', note: '' });
    setRequestOpen(true);
  };

  const openEditRequest = (item: AccessRequest) => {
    setEditingRequestId(item.id);
    setRequestForm({ name: item.name, email: item.email, role: item.role, department: item.department, status: item.status, note: item.note });
    setRequestOpen(true);
  };

  const saveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.email) return;

    if (editingRequestId !== null) {
      setAccessRequests((current) => current.map((item) => (item.id === editingRequestId ? { ...item, ...requestForm } : item)));
      addAudit(lang === 'fr' ? 'Mise a jour demande d acces' : 'تحديث طلب وصول', requestForm.name, ui.tabs.requests);
      notify(text.messages.updateSuccess);
    } else {
      setAccessRequests((current) => [...current, { id: nextId(current), requestedAt: new Date().toISOString(), ...requestForm }]);
      addAudit(lang === 'fr' ? 'Creation demande d acces' : 'إنشاء طلب وصول', requestForm.name, ui.tabs.requests);
      notify(text.messages.createSuccess);
    }

    setRequestOpen(false);
  };

  const removeRequest = (id: number) => {
    const target = accessRequests.find((item) => item.id === id);
    if (!target) return;
    if (window.confirm(text.messages.confirmDelete)) {
      setAccessRequests((current) => current.filter((item) => item.id !== id));
      addAudit(lang === 'fr' ? 'Suppression demande d acces' : 'حذف طلب وصول', target.name, ui.tabs.requests);
      notify(text.messages.deleteSuccess);
    }
  };

  const updateRequestStatus = (id: number, status: AccessRequestStatus) => {
    const target = accessRequests.find((item) => item.id === id);
    if (!target) return;

    setAccessRequests((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    addAudit(
      status === 'approved'
        ? lang === 'fr' ? 'Demande approuvee' : 'تمت الموافقة على الطلب'
        : lang === 'fr' ? 'Demande refusee' : 'تم رفض الطلب',
      target.name,
      ui.tabs.requests,
    );

    if (status === 'approved' && !users.some((item) => item.email === target.email)) {
      const permissions = getTemplatePermissions(target.role);
      setUsers((current) => [...current, {
        id: nextId(current),
        name: target.name,
        role: target.role,
        department: target.department,
        email: target.email,
        phone: '',
        status: 'active',
        twoFactor: false,
        lastLogin: new Date().toISOString(),
        permissions,
      }]);
      addAudit(lang === 'fr' ? 'Provisioning automatique' : 'إنشاء حساب تلقائي', target.name, text.modules.users);
    }

    notify(text.messages.updateSuccess);
  };

  const openAction = activeTab === 'accounts'
    ? <button onClick={openCreateUser} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> {text.actions.addUser}</button>
    : activeTab === 'profiles'
      ? <button onClick={openCreateProfile} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><FiPlus /> {ui.addProfile}</button>
      : activeTab === 'requests'
        ? <button onClick={openCreateRequest} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><FiPlus /> {ui.addRequest}</button>
        : undefined;

  const tabButton = (key: 'accounts' | 'profiles' | 'requests' | 'audit', icon: React.ReactNode, label: string) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${activeTab === key ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20' : theme === 'dark' ? 'bg-white/5 text-slate-200 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <SectionTitle theme={theme} title={text.moduleText.usersTitle} subtitle={ui.subtitle} action={openAction} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title={text.labels.total} value={String(users.length)} subtitle={text.modules.users} icon={FiUsers} />
        <MetricCard title={text.labels.activeAccount} value={String(users.filter((item) => item.status === 'active').length)} subtitle={text.labels.onlineStatus} icon={FiCheckCircle} />
        <MetricCard title={text.labels.twoFactor} value={String(users.filter((item) => item.twoFactor).length)} subtitle={text.dashboard.coverage} icon={FiShield} />
        <MetricCard title={ui.pendingRequests} value={String(accessRequests.filter((item) => item.status === 'pending').length)} subtitle={ui.requestsTitle} icon={FiBell} />
        <MetricCard title={ui.auditStream} value={String(auditEntries.length)} subtitle={ui.auditTitle} icon={FiClock} />
      </div>

      <div className="flex flex-wrap gap-3">
        {tabButton('accounts', <FiUsers className="h-4 w-4" />, ui.tabs.accounts)}
        {tabButton('profiles', <FiShield className="h-4 w-4" />, ui.tabs.profiles)}
        {tabButton('requests', <FiBell className="h-4 w-4" />, ui.tabs.requests)}
        {tabButton('audit', <FiClock className="h-4 w-4" />, ui.tabs.audit)}
      </div>

      <ToolbarCard theme={theme}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder={text.actions.search} theme={theme} />
          <div className="flex flex-wrap gap-3">
            {activeTab !== 'audit' && (
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | RoleKey)} className={fieldClass(theme)}>
                <option value="all">{text.labels.all}</option>
                {roleOptions.map((role) => <option key={role} value={role}>{labelRole(lang, role)}</option>)}
              </select>
            )}
            {(activeTab === 'accounts' || activeTab === 'requests') && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | UserStatus | AccessRequestStatus)} className={fieldClass(theme)}>
                <option value="all">{text.labels.all}</option>
                {activeTab === 'accounts' && <option value="active">{labelUserStatus(lang, 'active')}</option>}
                {activeTab === 'accounts' && <option value="suspended">{labelUserStatus(lang, 'suspended')}</option>}
                {activeTab === 'requests' && <option value="pending">{labelAccessRequestStatus(lang, 'pending')}</option>}
                {activeTab === 'requests' && <option value="approved">{labelAccessRequestStatus(lang, 'approved')}</option>}
                {activeTab === 'requests' && <option value="rejected">{labelAccessRequestStatus(lang, 'rejected')}</option>}
              </select>
            )}
          </div>
        </div>
      </ToolbarCard>

      {activeTab === 'accounts' && (
        <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead(theme)}>
                <tr>
                  <th className="px-4 py-3 text-start">{text.labels.name}</th>
                  <th className="px-4 py-3 text-start">{text.labels.role}</th>
                  <th className="px-4 py-3 text-start">{text.labels.department}</th>
                  <th className="px-4 py-3 text-start">{text.labels.email}</th>
                  <th className="px-4 py-3 text-start">{text.labels.permissions}</th>
                  <th className="px-4 py-3 text-start">{text.labels.lastLogin}</th>
                  <th className="px-4 py-3 text-start">{text.labels.twoFactor}</th>
                  <th className="px-4 py-3 text-start">{text.labels.status}</th>
                  <th className="px-4 py-3 text-end">{text.labels.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id} className={`${tableRow(theme)} align-top`}>
                    <td className="px-4 py-3"><div className="font-semibold">{item.name}</div><div className={muted(theme)}>{item.phone || item.email}</div></td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{labelRole(lang, item.role)}</td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{labelDepartment(lang, item.department)}</td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{item.email}</td>
                    <td className="px-4 py-3"><div className="flex max-w-xs flex-wrap gap-2">{item.permissions.map((permission) => <span key={permission} className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>{labelPermission(lang, permission)}</span>)}</div></td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{formatDateTime(item.lastLogin, lang)}</td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{item.twoFactor ? text.labels.enabled : text.labels.disabled}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status, theme)}`}>{labelUserStatus(lang, item.status)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={() => toggle2FA(item.id)} className="rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400">{text.actions.toggle2FA}</button>
                        <button onClick={() => toggleUserStatus(item.id)} className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400">{text.actions.toggleStatus}</button>
                        <button onClick={() => resetPassword(item)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>{text.actions.resetPassword}</button>
                        <button onClick={() => openEditUser(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button>
                        <button onClick={() => removeUser(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && <tr><td colSpan={9} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProfiles.map((item) => (
            <div key={item.id} className={`rounded-3xl p-5 ${surface(theme)}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>{labelRole(lang, item.role)}</div>
                  <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  <p className={`mt-2 text-sm ${muted(theme)}`}>{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditProfile(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button>
                  <button onClick={() => removeProfile(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{item.defaultPermissions.map((permission) => <span key={permission} className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>{labelPermission(lang, permission)}</span>)}</div>
              <div className={`mt-5 rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className={`text-xs ${muted(theme)}`}>{ui.staffCoverage}</div>
                <div className="mt-1 text-xl font-bold">{users.filter((user) => user.role === item.role).length}</div>
              </div>
            </div>
          ))}
          {!filteredProfiles.length && <EmptyState text={text.labels.noData} theme={theme} />}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className={`overflow-hidden rounded-3xl ${surface(theme)}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead(theme)}>
                <tr>
                  <th className="px-4 py-3 text-start">{text.labels.name}</th>
                  <th className="px-4 py-3 text-start">{text.labels.role}</th>
                  <th className="px-4 py-3 text-start">{text.labels.department}</th>
                  <th className="px-4 py-3 text-start">{text.labels.email}</th>
                  <th className="px-4 py-3 text-start">{ui.note}</th>
                  <th className="px-4 py-3 text-start">{ui.requestStatus}</th>
                  <th className="px-4 py-3 text-start">{text.labels.date}</th>
                  <th className="px-4 py-3 text-end">{text.labels.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((item) => (
                  <tr key={item.id} className={`${tableRow(theme)} align-top`}>
                    <td className="px-4 py-3"><div className="font-semibold">{item.name}</div><div className={muted(theme)}>{item.email}</div></td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{labelRole(lang, item.role)}</td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{labelDepartment(lang, item.department)}</td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{item.email}</td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{item.note || '-'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${accessRequestTone(item.status, theme)}`}>{labelAccessRequestStatus(lang, item.status)}</span></td>
                    <td className={`px-4 py-3 ${muted(theme)}`}>{formatDateTime(item.requestedAt, lang)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={() => updateRequestStatus(item.id, 'approved')} className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">{ui.approve}</button>
                        <button onClick={() => updateRequestStatus(item.id, 'rejected')} className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">{ui.reject}</button>
                        <button onClick={() => openEditRequest(item)} className="rounded-xl p-2 text-blue-500 hover:bg-blue-500/10"><FiEdit /></button>
                        <button onClick={() => removeRequest(item.id)} className="rounded-xl p-2 text-red-500 hover:bg-red-500/10"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredRequests.length && <tr><td colSpan={8} className={`px-4 py-10 text-center ${muted(theme)}`}>{text.labels.noData}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className={`border-t px-4 py-4 text-sm ${theme === 'dark' ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>{ui.automaticProvisioning}</div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className={`rounded-3xl p-5 ${surface(theme)}`}>
            <h3 className="text-lg font-semibold">{ui.auditTitle}</h3>
            <p className={`mt-1 text-sm ${muted(theme)}`}>{ui.auditSubtitle}</p>
          </div>
          <div className="space-y-3">
            {filteredAudit.map((entry) => (
              <div key={entry.id} className={`rounded-3xl p-4 ${surface(theme)}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{entry.action}</p>
                    <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs ${muted(theme)}`}>
                      <span>{ui.actor}: {entry.actor}</span>
                      <span>{ui.target}: {entry.target}</span>
                      <span>{ui.scope}: {entry.scope}</span>
                    </div>
                  </div>
                  <span className={`text-xs ${muted(theme)}`}>{formatDateTime(entry.timestamp, lang)}</span>
                </div>
              </div>
            ))}
            {!filteredAudit.length && <EmptyState text={text.labels.noData} theme={theme} />}
          </div>
        </div>
      )}

      <Modal open={userOpen} title={editingUserId ? text.actions.edit : text.actions.addUser} onClose={() => setUserOpen(false)} theme={theme}>
        <form onSubmit={saveUser} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.name}</span><input className={fieldClass(theme)} value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.role}</span><select className={fieldClass(theme)} value={userForm.role} onChange={(e) => setUserForm((current) => ({ ...current, role: e.target.value as RoleKey, permissions: getTemplatePermissions(e.target.value as RoleKey) }))}>{roleOptions.map((role) => <option key={role} value={role}>{labelRole(lang, role)}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.department}</span><select className={fieldClass(theme)} value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value as DepartmentKey })}>{departmentOptions.map((department) => <option key={department} value={department}>{labelDepartment(lang, department)}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.email}</span><input type="email" className={fieldClass(theme)} value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.phone}</span><input className={fieldClass(theme)} value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.status}</span><select className={fieldClass(theme)} value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value as UserStatus })}><option value="active">{labelUserStatus(lang, 'active')}</option><option value="suspended">{labelUserStatus(lang, 'suspended')}</option></select></label>
          <label className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}><input type="checkbox" checked={userForm.twoFactor} onChange={(e) => setUserForm({ ...userForm, twoFactor: e.target.checked })} />{text.labels.twoFactor}</label>
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{text.labels.permissions}</span>
              <button type="button" onClick={() => setUserForm((current) => ({ ...current, permissions: getTemplatePermissions(current.role) }))} className="text-xs font-semibold text-blue-500">{ui.applyTemplate}</button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">{permissionOptions.map((permission) => <label key={permission} className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}><input type="checkbox" checked={userForm.permissions.includes(permission)} onChange={() => toggleUserPermission(permission)} />{labelPermission(lang, permission)}</label>)}</div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setUserOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">{text.actions.save}</button></div>
        </form>
      </Modal>

      <Modal open={profileOpen} title={editingProfileId ? text.actions.edit : ui.addProfile} onClose={() => setProfileOpen(false)} theme={theme}>
        <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.role}</span><select className={fieldClass(theme)} value={profileForm.role} onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value as RoleKey })}>{roleOptions.map((role) => <option key={role} value={role}>{labelRole(lang, role)}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.name}</span><input className={fieldClass(theme)} value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} required /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.description}</span><textarea className={fieldClass(theme)} value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} rows={4} /></label>
          <div className="space-y-3 md:col-span-2"><span className="text-sm font-medium">{text.labels.permissions}</span><div className="grid gap-3 md:grid-cols-3">{permissionOptions.map((permission) => <label key={permission} className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}><input type="checkbox" checked={profileForm.defaultPermissions.includes(permission)} onChange={() => toggleProfilePermission(permission)} />{labelPermission(lang, permission)}</label>)}</div></div>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setProfileOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700">{text.actions.save}</button></div>
        </form>
      </Modal>

      <Modal open={requestOpen} title={editingRequestId ? text.actions.edit : ui.addRequest} onClose={() => setRequestOpen(false)} theme={theme}>
        <form onSubmit={saveRequest} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{text.labels.name}</span><input className={fieldClass(theme)} value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.email}</span><input type="email" className={fieldClass(theme)} value={requestForm.email} onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })} required /></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.role}</span><select className={fieldClass(theme)} value={requestForm.role} onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value as RoleKey })}>{roleOptions.map((role) => <option key={role} value={role}>{labelRole(lang, role)}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{text.labels.department}</span><select className={fieldClass(theme)} value={requestForm.department} onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value as DepartmentKey })}>{departmentOptions.map((department) => <option key={department} value={department}>{labelDepartment(lang, department)}</option>)}</select></label>
          <label className="space-y-2"><span className="text-sm font-medium">{ui.requestStatus}</span><select className={fieldClass(theme)} value={requestForm.status} onChange={(e) => setRequestForm({ ...requestForm, status: e.target.value as AccessRequestStatus })}><option value="pending">{labelAccessRequestStatus(lang, 'pending')}</option><option value="approved">{labelAccessRequestStatus(lang, 'approved')}</option><option value="rejected">{labelAccessRequestStatus(lang, 'rejected')}</option></select></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">{ui.note}</span><textarea className={fieldClass(theme)} value={requestForm.note} onChange={(e) => setRequestForm({ ...requestForm, note: e.target.value })} rows={4} /></label>
          <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setRequestOpen(false)} className={`rounded-2xl px-4 py-3 font-semibold ${theme === 'dark' ? 'border border-white/10 text-slate-200' : 'border border-slate-300 text-slate-700'}`}>{text.actions.cancel}</button><button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">{text.actions.save}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function LoginView({ lang, theme, onLogin, onSwitchLang, onToggleTheme }: { lang: Lang; theme: ThemeMode; onLogin: () => void; onSwitchLang: (lang: Lang) => void; onToggleTheme: () => void; }) {
  const text = TEXT[lang];
  const [email, setEmail] = useState('admin@hopital-central.test');
  const [password, setPassword] = useState('admin1234');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 4) {
      setError(text.login.invalid);
      return;
    }
    setError('');
    onLogin();
  };

  return (
    <div className={`min-h-screen ${pageShell(theme)} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.18),transparent_26%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="mb-10 max-w-xl lg:mb-0">
          <div className="mb-6 flex items-center gap-4">
            {hospitalLogo(theme)}
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${muted(theme)}`}>{text.acronym}</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{text.appName}</h1>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-cyan-200' : 'bg-blue-50 text-blue-700'}`}>
            <FiShield className="h-4 w-4" />
            {text.login.welcome}
          </div>
          <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{text.login.title}</h2>
          <p className={`mt-4 max-w-lg text-base leading-7 ${muted(theme)}`}>{text.login.subtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[text.login.feature1, text.login.feature2, text.login.feature3, text.login.feature4].map((item) => (
              <div key={item} className={`rounded-2xl p-4 ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-white/80'}`}>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-2 text-white">
                    <FiCheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`w-full max-w-xl rounded-[2rem] p-6 sm:p-8 ${surface(theme)}`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {hospitalLogo(theme)}
              <div>
                <h3 className="text-xl font-bold">{text.appName}</h3>
                <p className={`text-sm ${muted(theme)}`}>{text.appTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onSwitchLang('fr')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${lang === 'fr' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>FR</button>
              <button onClick={() => onSwitchLang('ar')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${lang === 'ar' ? 'bg-violet-600 text-white' : theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>AR</button>
              <button onClick={onToggleTheme} className={`rounded-xl p-2 ${theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2"><span className="text-sm font-medium">{text.login.email}</span><input type="email" className={fieldClass(theme)} value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="block space-y-2"><span className="text-sm font-medium">{text.login.password}</span><div className="relative"><input type={showPassword ? 'text' : 'password'} className={`${fieldClass(theme)} pe-12`} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword((v) => !v)} className={`absolute end-3 top-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}</button></div></label>
            <label className="inline-flex items-center gap-3 text-sm"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />{text.login.remember}</label>
            {error && <div className={`rounded-2xl p-3 text-sm ${theme === 'dark' ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-700'}`}>{error}</div>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:opacity-95">
              <FiLogIn className="h-4 w-4" />
              {text.login.submit}
            </button>
            <button type="button" onClick={onLogin} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10' : 'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
              <FiHome className="h-4 w-4" />
              {text.actions.demoAccess}
            </button>
          </form>

          <p className={`mt-4 text-sm ${muted(theme)}`}>{text.login.helper}</p>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const seed = useMemo(() => createSeed(), []);
  const [lang, setLang] = useLocalStorageState<Lang>(storageKey('lang'), 'fr');
  const [theme, setTheme] = useLocalStorageState<ThemeMode>(storageKey('theme'), 'light');
  const [isAuthenticated, setIsAuthenticated] = useLocalStorageState<boolean>(storageKey('auth'), true);
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [patients, setPatients] = useLocalStorageState<Patient[]>(storageKey('patients'), seed.patients);
  const [appointments, setAppointments] = useLocalStorageState<Appointment[]>(storageKey('appointments'), seed.appointments);
  const [records, setRecords] = useLocalStorageState<MedicalRecord[]>(storageKey('records'), seed.records);
  const [labTests, setLabTests] = useLocalStorageState<LabTest[]>(storageKey('labtests'), seed.labTests);
  const [medications, setMedications] = useLocalStorageState<Medication[]>(storageKey('medications'), seed.medications);
  const [invoices, setInvoices] = useLocalStorageState<Invoice[]>(storageKey('invoices'), seed.invoices);
  const [users, setUsers] = useLocalStorageState<UserAccount[]>(storageKey('users'), seed.users);
  const [roleProfiles, setRoleProfiles] = useLocalStorageState<RoleProfile[]>(storageKey('roleProfiles'), seed.roleProfiles);
  const [accessRequests, setAccessRequests] = useLocalStorageState<AccessRequest[]>(storageKey('accessRequests'), seed.accessRequests);
  const [auditEntries, setAuditEntries] = useLocalStorageState<AuditEntry[]>(storageKey('auditEntries'), seed.auditEntries);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });

  const text = TEXT[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
    document.title = `${TEXT[lang].appName} | ${TEXT[lang].appTitle}`;
  }, [lang, isRTL, theme]);

  useEffect(() => {
    if (!toast.visible) return;
    const timer = window.setTimeout(() => setToast({ visible: false, message: '' }), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast({ visible: true, message });

  const navigation = [
    { key: 'dashboard' as const, label: text.modules.dashboard, icon: FiHome },
    { key: 'patients' as const, label: text.modules.patients, icon: FiUsers },
    { key: 'appointments' as const, label: text.modules.appointments, icon: FiCalendar },
    { key: 'records' as const, label: text.modules.records, icon: FiFileText },
    { key: 'laboratory' as const, label: text.modules.laboratory, icon: FiActivity },
    { key: 'pharmacy' as const, label: text.modules.pharmacy, icon: FiPackage },
    { key: 'billing' as const, label: text.modules.billing, icon: FiCreditCard },
    { key: 'users' as const, label: text.modules.users, icon: FiShield },
  ];

  const deletePatientCascade = (id: number) => {
    setPatients((current) => current.filter((item) => item.id !== id));
    setAppointments((current) => current.filter((item) => item.patientId !== id));
    setRecords((current) => current.filter((item) => item.patientId !== id));
    setLabTests((current) => current.filter((item) => item.patientId !== id));
    setInvoices((current) => current.filter((item) => item.patientId !== id));
    notify(text.messages.patientCascadeDelete);
  };

  const resetDemoData = () => {
    const fresh = createSeed();
    setPatients(fresh.patients);
    setAppointments(fresh.appointments);
    setRecords(fresh.records);
    setLabTests(fresh.labTests);
    setMedications(fresh.medications);
    setInvoices(fresh.invoices);
    setUsers(fresh.users);
    setRoleProfiles(fresh.roleProfiles);
    setAccessRequests(fresh.accessRequests);
    setAuditEntries(fresh.auditEntries);
    notify(text.messages.resetSuccess);
  };

  const syncDashboard = () => notify(text.messages.syncSuccess);

  const handleLogin = () => {
    setIsAuthenticated(true);
    notify(text.messages.loginSuccess);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    notify(text.messages.logoutSuccess);
  };

  const handleThemeToggle = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    notify(text.messages.themeUpdated);
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'patients':
        return <PatientsView lang={lang} theme={theme} patients={patients} setPatients={setPatients} onDeleteCascade={deletePatientCascade} notify={notify} />;
      case 'appointments':
        return <AppointmentsView lang={lang} theme={theme} patients={patients} appointments={appointments} setAppointments={setAppointments} notify={notify} />;
      case 'records':
        return <RecordsView lang={lang} theme={theme} patients={patients} records={records} setRecords={setRecords} notify={notify} />;
      case 'laboratory':
        return <LaboratoryView lang={lang} theme={theme} patients={patients} labTests={labTests} setLabTests={setLabTests} notify={notify} />;
      case 'pharmacy':
        return <PharmacyView lang={lang} theme={theme} medications={medications} setMedications={setMedications} notify={notify} />;
      case 'billing':
        return <BillingView lang={lang} theme={theme} patients={patients} invoices={invoices} setInvoices={setInvoices} notify={notify} />;
      case 'users':
        return <UsersView lang={lang} theme={theme} users={users} setUsers={setUsers} roleProfiles={roleProfiles} setRoleProfiles={setRoleProfiles} accessRequests={accessRequests} setAccessRequests={setAccessRequests} auditEntries={auditEntries} setAuditEntries={setAuditEntries} notify={notify} />;
      default:
        return <DashboardView lang={lang} theme={theme} patients={patients} appointments={appointments} records={records} labTests={labTests} medications={medications} users={users} invoices={invoices} roleProfiles={roleProfiles} accessRequests={accessRequests} auditEntries={auditEntries} onNavigate={setActiveModule} onSync={syncDashboard} onReset={resetDemoData} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView lang={lang} theme={theme} onLogin={handleLogin} onSwitchLang={setLang} onToggleTheme={handleThemeToggle} />;
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${pageShell(theme)}`}>
      <Toast toast={toast} theme={theme} />
      <div className="flex min-h-screen">
        <aside className={`hidden w-72 flex-col lg:flex ${theme === 'dark' ? 'border-e border-white/10 bg-slate-950 text-slate-100' : 'border-e border-slate-200 bg-slate-950 text-slate-100'}`}>
          <div className={`px-6 py-6 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-slate-800'}`}>
            <div className="flex items-center gap-3">
              {hospitalLogo(theme)}
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{text.acronym}</p>
                <h1 className="text-xl font-bold">{text.appName}</h1>
                <p className="mt-1 text-xs text-slate-400">{text.appTitle}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeModule === item.key;
              return (
                <button key={item.key} onClick={() => setActiveModule(item.key)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-start text-sm font-medium transition ${active ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="space-y-3 border-t border-white/10 p-4 text-xs text-slate-400">
            <div className="rounded-2xl bg-white/5 p-3">{text.interactiveDashboard} • CRUD • FR / AR</div>
            <button onClick={handleLogout} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15">
              <FiLogOut className="h-4 w-4" />
              {text.actions.signOut}
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className={`sticky top-0 z-20 backdrop-blur ${theme === 'dark' ? 'border-b border-white/10 bg-slate-950/85' : 'border-b border-slate-200 bg-white/90'}`}>
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className={`text-sm ${muted(theme)}`}>{text.appTitle}</p>
                  <h2 className="text-2xl font-bold">{navigation.find((item) => item.key === activeModule)?.label}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-1 rounded-2xl p-1.5 shadow-sm ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-violet-50'}`}>
                    <button onClick={() => setLang('fr')} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${lang === 'fr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-white/80'}`}>FR</button>
                    <button onClick={() => setLang('ar')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${lang === 'ar' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-white/80'}`}><FiGlobe className="h-4 w-4" /> AR</button>
                  </div>

                  <button onClick={handleThemeToggle} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-100' : 'border border-slate-200 bg-white text-slate-700'}`}>
                    {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                    {theme === 'dark' ? text.theme.light : text.theme.dark}
                  </button>

                  <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-gradient-to-r from-white to-slate-50'}`}>
                    <div className="rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 p-2 text-white shadow-lg shadow-blue-200"><FiUser /></div>
                    <div>
                      <p className="text-sm font-semibold">{text.appName}</p>
                      <p className={`text-xs ${muted(theme)}`}>{text.dashboard.overview}</p>
                    </div>
                  </div>

                  <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/15">
                    <FiLogOut className="h-4 w-4" />
                    {text.actions.signOut}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:hidden">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.key;
                  return (
                    <button key={item.key} onClick={() => setActiveModule(item.key)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${active ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-white/10 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className={`rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}><span className="font-semibold">{text.cards.patients}:</span> {patients.length}</div>
                <div className={`rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}><span className="font-semibold">{text.cards.appointments}:</span> {appointments.length}</div>
                <div className={`rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}><span className="font-semibold">{text.cards.openLabs}:</span> {labTests.length}</div>
                <div className={`rounded-2xl px-4 py-3 text-sm ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}><span className="font-semibold">{text.modules.users}:</span> {users.length}</div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
