import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ru' | 'lv' | 'lt' | 'et' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.users': 'User Management',
    'nav.companies': 'Companies',
    'nav.drivers': 'Drivers',
    'nav.clients': 'Clients',
    'nav.rides': 'Ride Management',
    'nav.support': 'Support Tickets',
    'nav.config': 'System Config',
    'nav.audit': 'Audit Logs',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.suspended': 'Suspended',
    'common.pending': 'Pending',
    'common.all': 'All',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.view': 'View',
    'common.export': 'Export',
    'common.refresh': 'Refresh',
    'common.previous': 'Previous',
    'common.next': 'Next',
    'common.showing': 'Showing',
    'common.to': 'to',
    'common.of': 'of',
    'common.results': 'results',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.activeUsers': 'Active Users',
    'dashboard.activeDrivers': 'Active Drivers',
    'dashboard.dailyRevenue': 'Daily Revenue',
    'dashboard.openTickets': 'Open Tickets',
    'dashboard.weeklyPerformance': 'Weekly Performance',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.liveTracking': 'Live Ride Tracking',
    'dashboard.activeRides': 'Active Rides',
    'dashboard.availableDrivers': 'Available Drivers',
    
    // User Management
    'users.title': 'User Management',
    'users.addNew': 'Add New User',
    'users.searchPlaceholder': 'Search by name, email, or phone...',
    'users.allUsers': 'All Users',
    'users.drivers': 'Drivers',
    'users.riders': 'Riders',
    'users.contact': 'Contact',
    'users.type': 'Type',
    'users.rating': 'Rating',
    'users.rides': 'Rides',
    
    // Company Management
    'companies.title': 'Company Management',
    'companies.addNew': 'Add New Company',
    'companies.totalCompanies': 'Total Companies',
    'companies.activeCompanies': 'Active Companies',
    'companies.totalDrivers': 'Total Drivers',
    'companies.monthlyRevenue': 'Monthly Revenue',
    'companies.searchPlaceholder': 'Search by company name, email, or contact person...',
    'companies.company': 'Company',
    'companies.contact': 'Contact',
    'companies.drivers': 'Drivers',
    'companies.performance': 'Performance',
    
    // Driver Management
    'drivers.title': 'Driver Management',
    'drivers.addNew': 'Add New Driver',
    'drivers.totalDrivers': 'Total Drivers',
    'drivers.activeDrivers': 'Active Drivers',
    'drivers.pendingApproval': 'Pending Approval',
    'drivers.avgRating': 'Avg Rating',
    'drivers.totalRides': 'Total Rides',
    'drivers.searchPlaceholder': 'Search by name, email, company, or license plate...',
    'drivers.driver': 'Driver',
    'drivers.contactCompany': 'Contact & Company',
    'drivers.vehicle': 'Vehicle',
    'drivers.performance': 'Performance',
    'drivers.documents': 'Documents',
    'drivers.offline': 'Offline',
    
    // Client Management
    'clients.title': 'Client Management',
    'clients.addNew': 'Add New Client',
    'clients.totalClients': 'Total Clients',
    'clients.activeClients': 'Active Clients',
    'clients.avgRating': 'Avg Rating',
    'clients.totalRides': 'Total Rides',
    'clients.totalRevenue': 'Total Revenue',
    'clients.searchPlaceholder': 'Search by name, email, or phone...',
    'clients.client': 'Client',
    'clients.contactAddress': 'Contact & Address',
    'clients.activity': 'Activity',
    'clients.spending': 'Spending',
    'clients.preferences': 'Preferences',
    
    // Ride Management
    'rides.title': 'Ride Management',
    'rides.activeRides': 'Active Rides',
    'rides.completedToday': 'Completed Today',
    'rides.pendingRequests': 'Pending Requests',
    'rides.todaysRevenue': 'Today\'s Revenue',
    'rides.searchPlaceholder': 'Search by ride ID, rider, or driver...',
    'rides.rideDetails': 'Ride Details',
    'rides.route': 'Route',
    'rides.fare': 'Fare',
    'rides.time': 'Time',
    'rides.ongoing': 'Ongoing',
    'rides.completed': 'Completed',
    'rides.cancelled': 'Cancelled',
    'rides.liveMapView': 'Live Map View',
    
    // Support Tickets
    'support.title': 'Support Tickets',
    'support.createTicket': 'Create Ticket',
    'support.openTickets': 'Open Tickets',
    'support.inProgress': 'In Progress',
    'support.resolvedToday': 'Resolved Today',
    'support.avgResponseTime': 'Avg Response Time',
    'support.searchPlaceholder': 'Search tickets by ID, subject, or user...',
    'support.ticket': 'Ticket',
    'support.user': 'User',
    'support.category': 'Category',
    'support.priority': 'Priority',
    'support.assignee': 'Assignee',
    'support.resolved': 'Resolved',
    'support.closed': 'Closed',
    
    // System Config
    'config.title': 'System Configuration',
    'config.saveAll': 'Save All Changes',
    'config.geofencing': 'Geofencing',
    'config.surgeZones': 'Surge Zones',
    'config.notifications': 'Notifications',
    'config.localization': 'Localization',
    
    // Audit Logs
    'audit.title': 'Audit Logs',
    'audit.exportLogs': 'Export Logs',
    'audit.todaysActions': 'Today\'s Actions',
    'audit.highSeverity': 'High Severity',
    'audit.failedLogins': 'Failed Logins',
    'audit.activeSessions': 'Active Sessions',
    'audit.searchPlaceholder': 'Search by user, action, or target...',
    'audit.timestamp': 'Timestamp',
    'audit.action': 'Action',
    'audit.target': 'Target',
    'audit.details': 'Details',
    'audit.severity': 'Severity',
    
    // Header
    'header.searchPlaceholder': 'Search users, rides, tickets...',
    'header.lastLogin': 'Last login',
    'header.today': 'Today',
    'header.switchTheme': 'Switch to {mode} mode',
    'header.light': 'light',
    'header.dark': 'dark',
    
    // Footer
    'footer.superAdmin': 'Super Admin',
    'footer.adminEmail': 'admin@taxifinder.com'
  },
  
  ru: {
    // Navigation
    'nav.dashboard': 'Панель управления',
    'nav.users': 'Управление пользователями',
    'nav.companies': 'Компании',
    'nav.drivers': 'Водители',
    'nav.clients': 'Клиенты',
    'nav.rides': 'Управление поездками',
    'nav.support': 'Заявки поддержки',
    'nav.config': 'Настройки системы',
    'nav.audit': 'Журнал аудита',
    
    // Common
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.actions': 'Действия',
    'common.status': 'Статус',
    'common.active': 'Активный',
    'common.inactive': 'Неактивный',
    'common.suspended': 'Заблокирован',
    'common.pending': 'Ожидает',
    'common.all': 'Все',
    'common.add': 'Добавить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.view': 'Просмотр',
    'common.export': 'Экспорт',
    'common.refresh': 'Обновить',
    'common.previous': 'Предыдущая',
    'common.next': 'Следующая',
    'common.showing': 'Показано',
    'common.to': 'до',
    'common.of': 'из',
    'common.results': 'результатов',
    
    // Dashboard
    'dashboard.title': 'Панель управления',
    'dashboard.activeUsers': 'Активные пользователи',
    'dashboard.activeDrivers': 'Активные водители',
    'dashboard.dailyRevenue': 'Дневная выручка',
    'dashboard.openTickets': 'Открытые заявки',
    'dashboard.weeklyPerformance': 'Недельная производительность',
    'dashboard.recentActivity': 'Последняя активность',
    'dashboard.liveTracking': 'Отслеживание поездок в реальном времени',
    'dashboard.activeRides': 'Активные поездки',
    'dashboard.availableDrivers': 'Доступные водители',
    
    // User Management
    'users.title': 'Управление пользователями',
    'users.addNew': 'Добавить пользователя',
    'users.searchPlaceholder': 'Поиск по имени, email или телефону...',
    'users.allUsers': 'Все пользователи',
    'users.drivers': 'Водители',
    'users.riders': 'Пассажиры',
    'users.contact': 'Контакты',
    'users.type': 'Тип',
    'users.rating': 'Рейтинг',
    'users.rides': 'Поездки',
    
    // Company Management
    'companies.title': 'Управление компаниями',
    'companies.addNew': 'Добавить компанию',
    'companies.totalCompanies': 'Всего компаний',
    'companies.activeCompanies': 'Активные компании',
    'companies.totalDrivers': 'Всего водителей',
    'companies.monthlyRevenue': 'Месячная выручка',
    'companies.searchPlaceholder': 'Поиск по названию компании, email или контактному лицу...',
    'companies.company': 'Компания',
    'companies.contact': 'Контакты',
    'companies.drivers': 'Водители',
    'companies.performance': 'Производительность',
    
    // Driver Management
    'drivers.title': 'Управление водителями',
    'drivers.addNew': 'Добавить водителя',
    'drivers.totalDrivers': 'Всего водителей',
    'drivers.activeDrivers': 'Активные водители',
    'drivers.pendingApproval': 'Ожидают одобрения',
    'drivers.avgRating': 'Средний рейтинг',
    'drivers.totalRides': 'Всего поездок',
    'drivers.searchPlaceholder': 'Поиск по имени, email, компании или номеру...',
    'drivers.driver': 'Водитель',
    'drivers.contactCompany': 'Контакты и компания',
    'drivers.vehicle': 'Транспорт',
    'drivers.performance': 'Производительность',
    'drivers.documents': 'Документы',
    'drivers.offline': 'Не в сети',
    
    // Client Management
    'clients.title': 'Управление клиентами',
    'clients.addNew': 'Добавить клиента',
    'clients.totalClients': 'Всего клиентов',
    'clients.activeClients': 'Активные клиенты',
    'clients.avgRating': 'Средний рейтинг',
    'clients.totalRides': 'Всего поездок',
    'clients.totalRevenue': 'Общая выручка',
    'clients.searchPlaceholder': 'Поиск по имени, email или телефону...',
    'clients.client': 'Клиент',
    'clients.contactAddress': 'Контакты и адрес',
    'clients.activity': 'Активность',
    'clients.spending': 'Расходы',
    'clients.preferences': 'Предпочтения',
    
    // Ride Management
    'rides.title': 'Управление поездками',
    'rides.activeRides': 'Активные поездки',
    'rides.completedToday': 'Завершено сегодня',
    'rides.pendingRequests': 'Ожидающие запросы',
    'rides.todaysRevenue': 'Выручка за сегодня',
    'rides.searchPlaceholder': 'Поиск по ID поездки, пассажиру или водителю...',
    'rides.rideDetails': 'Детали поездки',
    'rides.route': 'Маршрут',
    'rides.fare': 'Стоимость',
    'rides.time': 'Время',
    'rides.ongoing': 'В процессе',
    'rides.completed': 'Завершена',
    'rides.cancelled': 'Отменена',
    'rides.liveMapView': 'Карта в реальном времени',
    
    // Support Tickets
    'support.title': 'Заявки поддержки',
    'support.createTicket': 'Создать заявку',
    'support.openTickets': 'Открытые заявки',
    'support.inProgress': 'В работе',
    'support.resolvedToday': 'Решено сегодня',
    'support.avgResponseTime': 'Среднее время ответа',
    'support.searchPlaceholder': 'Поиск заявок по ID, теме или пользователю...',
    'support.ticket': 'Заявка',
    'support.user': 'Пользователь',
    'support.category': 'Категория',
    'support.priority': 'Приоритет',
    'support.assignee': 'Исполнитель',
    'support.resolved': 'Решена',
    'support.closed': 'Закрыта',
    
    // System Config
    'config.title': 'Настройки системы',
    'config.saveAll': 'Сохранить все изменения',
    'config.geofencing': 'Геозоны',
    'config.surgeZones': 'Зоны повышенного тарифа',
    'config.notifications': 'Уведомления',
    'config.localization': 'Локализация',
    
    // Audit Logs
    'audit.title': 'Журнал аудита',
    'audit.exportLogs': 'Экспорт журналов',
    'audit.todaysActions': 'Действия за сегодня',
    'audit.highSeverity': 'Высокая важность',
    'audit.failedLogins': 'Неудачные входы',
    'audit.activeSessions': 'Активные сессии',
    'audit.searchPlaceholder': 'Поиск по пользователю, действию или цели...',
    'audit.timestamp': 'Время',
    'audit.action': 'Действие',
    'audit.target': 'Цель',
    'audit.details': 'Детали',
    'audit.severity': 'Важность',
    
    // Header
    'header.searchPlaceholder': 'Поиск пользователей, поездок, заявок...',
    'header.lastLogin': 'Последний вход',
    'header.today': 'Сегодня',
    'header.switchTheme': 'Переключить на {mode} тему',
    'header.light': 'светлую',
    'header.dark': 'тёмную',
    
    // Footer
    'footer.superAdmin': 'Супер Администратор',
    'footer.adminEmail': 'admin@taxifinder.com'
  },
  
  lv: {
    // Navigation
    'nav.dashboard': 'Vadības panelis',
    'nav.users': 'Lietotāju pārvaldība',
    'nav.companies': 'Uzņēmumi',
    'nav.drivers': 'Vadītāji',
    'nav.clients': 'Klienti',
    'nav.rides': 'Braucienu pārvaldība',
    'nav.support': 'Atbalsta pieprasījumi',
    'nav.config': 'Sistēmas konfigurācija',
    'nav.audit': 'Audita žurnāls',
    
    // Common
    'common.search': 'Meklēt',
    'common.filter': 'Filtrs',
    'common.actions': 'Darbības',
    'common.status': 'Statuss',
    'common.active': 'Aktīvs',
    'common.inactive': 'Neaktīvs',
    'common.suspended': 'Bloķēts',
    'common.pending': 'Gaida',
    'common.all': 'Visi',
    'common.add': 'Pievienot',
    'common.edit': 'Rediģēt',
    'common.delete': 'Dzēst',
    'common.save': 'Saglabāt',
    'common.cancel': 'Atcelt',
    'common.view': 'Skatīt',
    'common.export': 'Eksportēt',
    'common.refresh': 'Atjaunot',
    'common.previous': 'Iepriekšējā',
    'common.next': 'Nākamā',
    'common.showing': 'Rāda',
    'common.to': 'līdz',
    'common.of': 'no',
    'common.results': 'rezultātiem',
    
    // Dashboard
    'dashboard.title': 'Vadības panelis',
    'dashboard.activeUsers': 'Aktīvie lietotāji',
    'dashboard.activeDrivers': 'Aktīvie vadītāji',
    'dashboard.dailyRevenue': 'Dienas ieņēmumi',
    'dashboard.openTickets': 'Atvērtie pieprasījumi',
    'dashboard.weeklyPerformance': 'Nedēļas veiktspēja',
    'dashboard.recentActivity': 'Pēdējā aktivitāte',
    'dashboard.liveTracking': 'Braucienu izsekošana reāllaikā',
    'dashboard.activeRides': 'Aktīvie braucieni',
    'dashboard.availableDrivers': 'Pieejamie vadītāji',
    
    // User Management
    'users.title': 'Lietotāju pārvaldība',
    'users.addNew': 'Pievienot lietotāju',
    'users.searchPlaceholder': 'Meklēt pēc vārda, e-pasta vai tālruņa...',
    'users.allUsers': 'Visi lietotāji',
    'users.drivers': 'Vadītāji',
    'users.riders': 'Pasažieri',
    'users.contact': 'Kontakti',
    'users.type': 'Tips',
    'users.rating': 'Vērtējums',
    'users.rides': 'Braucieni',
    
    // Company Management
    'companies.title': 'Uzņēmumu pārvaldība',
    'companies.addNew': 'Pievienot uzņēmumu',
    'companies.totalCompanies': 'Kopā uzņēmumu',
    'companies.activeCompanies': 'Aktīvie uzņēmumi',
    'companies.totalDrivers': 'Kopā vadītāju',
    'companies.monthlyRevenue': 'Mēneša ieņēmumi',
    'companies.searchPlaceholder': 'Meklēt pēc uzņēmuma nosaukuma, e-pasta vai kontaktpersonas...',
    'companies.company': 'Uzņēmums',
    'companies.contact': 'Kontakti',
    'companies.drivers': 'Vadītāji',
    'companies.performance': 'Veiktspēja',
    
    // Driver Management
    'drivers.title': 'Vadītāju pārvaldība',
    'drivers.addNew': 'Pievienot vadītāju',
    'drivers.totalDrivers': 'Kopā vadītāju',
    'drivers.activeDrivers': 'Aktīvie vadītāji',
    'drivers.pendingApproval': 'Gaida apstiprinājumu',
    'drivers.avgRating': 'Vidējais vērtējums',
    'drivers.totalRides': 'Kopā braucienu',
    'drivers.searchPlaceholder': 'Meklēt pēc vārda, e-pasta, uzņēmuma vai numura...',
    'drivers.driver': 'Vadītājs',
    'drivers.contactCompany': 'Kontakti un uzņēmums',
    'drivers.vehicle': 'Transportlīdzeklis',
    'drivers.performance': 'Veiktspēja',
    'drivers.documents': 'Dokumenti',
    'drivers.offline': 'Bezsaistē',
    
    // Client Management
    'clients.title': 'Klientu pārvaldība',
    'clients.addNew': 'Pievienot klientu',
    'clients.totalClients': 'Kopā klientu',
    'clients.activeClients': 'Aktīvie klienti',
    'clients.avgRating': 'Vidējais vērtējums',
    'clients.totalRides': 'Kopā braucienu',
    'clients.totalRevenue': 'Kopējie ieņēmumi',
    'clients.searchPlaceholder': 'Meklēt pēc vārda, e-pasta vai tālruņa...',
    'clients.client': 'Klients',
    'clients.contactAddress': 'Kontakti un adrese',
    'clients.activity': 'Aktivitāte',
    'clients.spending': 'Tēriņi',
    'clients.preferences': 'Preferences',
    
    // Ride Management
    'rides.title': 'Braucienu pārvaldība',
    'rides.activeRides': 'Aktīvie braucieni',
    'rides.completedToday': 'Pabeigti šodien',
    'rides.pendingRequests': 'Gaidošie pieprasījumi',
    'rides.todaysRevenue': 'Šodienas ieņēmumi',
    'rides.searchPlaceholder': 'Meklēt pēc brauciena ID, pasažiera vai vadītāja...',
    'rides.rideDetails': 'Brauciena detaļas',
    'rides.route': 'Maršruts',
    'rides.fare': 'Maksa',
    'rides.time': 'Laiks',
    'rides.ongoing': 'Notiek',
    'rides.completed': 'Pabeigts',
    'rides.cancelled': 'Atcelts',
    'rides.liveMapView': 'Karte reāllaikā',
    
    // Support Tickets
    'support.title': 'Atbalsta pieprasījumi',
    'support.createTicket': 'Izveidot pieprasījumu',
    'support.openTickets': 'Atvērtie pieprasījumi',
    'support.inProgress': 'Procesā',
    'support.resolvedToday': 'Atrisināti šodien',
    'support.avgResponseTime': 'Vidējais atbildes laiks',
    'support.searchPlaceholder': 'Meklēt pieprasījumus pēc ID, tēmas vai lietotāja...',
    'support.ticket': 'Pieprasījums',
    'support.user': 'Lietotājs',
    'support.category': 'Kategorija',
    'support.priority': 'Prioritāte',
    'support.assignee': 'Izpildītājs',
    'support.resolved': 'Atrisināts',
    'support.closed': 'Slēgts',
    
    // System Config
    'config.title': 'Sistēmas konfigurācija',
    'config.saveAll': 'Saglabāt visas izmaiņas',
    'config.geofencing': 'Ģeogrāfiskās zonas',
    'config.surgeZones': 'Paaugstināta tarifa zonas',
    'config.notifications': 'Paziņojumi',
    'config.localization': 'Lokalizācija',
    
    // Audit Logs
    'audit.title': 'Audita žurnāls',
    'audit.exportLogs': 'Eksportēt žurnālus',
    'audit.todaysActions': 'Šodienas darbības',
    'audit.highSeverity': 'Augsta svarīguma',
    'audit.failedLogins': 'Neveiksmīgas pieteikšanās',
    'audit.activeSessions': 'Aktīvās sesijas',
    'audit.searchPlaceholder': 'Meklēt pēc lietotāja, darbības vai mērķa...',
    'audit.timestamp': 'Laiks',
    'audit.action': 'Darbība',
    'audit.target': 'Mērķis',
    'audit.details': 'Detaļas',
    'audit.severity': 'Svarīgums',
    
    // Header
    'header.searchPlaceholder': 'Meklēt lietotājus, braucienus, pieprasījumus...',
    'header.lastLogin': 'Pēdējā pieteikšanās',
    'header.today': 'Šodien',
    'header.switchTheme': 'Pārslēgt uz {mode} tēmu',
    'header.light': 'gaišo',
    'header.dark': 'tumšo',
    
    // Footer
    'footer.superAdmin': 'Super Administrators',
    'footer.adminEmail': 'admin@taxifinder.com'
  },

  lt: {
    // Navigation
    'nav.dashboard': 'Valdymo skydelis',
    'nav.users': 'Vartotojų valdymas',
    'nav.companies': 'Įmonės',
    'nav.drivers': 'Vairuotojai',
    'nav.clients': 'Klientai',
    'nav.rides': 'Kelionių valdymas',
    'nav.support': 'Pagalbos užklausos',
    'nav.config': 'Sistemos konfigūracija',
    'nav.audit': 'Audito žurnalas',
    
    // Common
    'common.search': 'Ieškoti',
    'common.filter': 'Filtras',
    'common.actions': 'Veiksmai',
    'common.status': 'Būsena',
    'common.active': 'Aktyvus',
    'common.inactive': 'Neaktyvus',
    'common.suspended': 'Užblokuotas',
    'common.pending': 'Laukia',
    'common.all': 'Visi',
    'common.add': 'Pridėti',
    'common.edit': 'Redaguoti',
    'common.delete': 'Ištrinti',
    'common.save': 'Išsaugoti',
    'common.cancel': 'Atšaukti',
    'common.view': 'Peržiūrėti',
    'common.export': 'Eksportuoti',
    'common.refresh': 'Atnaujinti',
    'common.previous': 'Ankstesnis',
    'common.next': 'Kitas',
    'common.showing': 'Rodoma',
    'common.to': 'iki',
    'common.of': 'iš',
    'common.results': 'rezultatų',
    
    // Dashboard
    'dashboard.title': 'Valdymo skydelis',
    'dashboard.activeUsers': 'Aktyvūs vartotojai',
    'dashboard.activeDrivers': 'Aktyvūs vairuotojai',
    'dashboard.dailyRevenue': 'Dienos pajamos',
    'dashboard.openTickets': 'Atviros užklausos',
    'dashboard.weeklyPerformance': 'Savaitės veikla',
    'dashboard.recentActivity': 'Paskutinė veikla',
    'dashboard.liveTracking': 'Kelionių sekimas realiu laiku',
    'dashboard.activeRides': 'Aktyvios kelionės',
    'dashboard.availableDrivers': 'Prieinami vairuotojai',
    
    // User Management
    'users.title': 'Vartotojų valdymas',
    'users.addNew': 'Pridėti vartotoją',
    'users.searchPlaceholder': 'Ieškoti pagal vardą, el. paštą ar telefoną...',
    'users.allUsers': 'Visi vartotojai',
    'users.drivers': 'Vairuotojai',
    'users.riders': 'Keleiviai',
    'users.contact': 'Kontaktai',
    'users.type': 'Tipas',
    'users.rating': 'Įvertinimas',
    'users.rides': 'Kelionės',
    
    // Company Management
    'companies.title': 'Įmonių valdymas',
    'companies.addNew': 'Pridėti įmonę',
    'companies.totalCompanies': 'Iš viso įmonių',
    'companies.activeCompanies': 'Aktyvios įmonės',
    'companies.totalDrivers': 'Iš viso vairuotojų',
    'companies.monthlyRevenue': 'Mėnesio pajamos',
    'companies.searchPlaceholder': 'Ieškoti pagal įmonės pavadinimą, el. paštą ar kontaktinį asmenį...',
    'companies.company': 'Įmonė',
    'companies.contact': 'Kontaktai',
    'companies.drivers': 'Vairuotojai',
    'companies.performance': 'Veikla',
    
    // Driver Management
    'drivers.title': 'Vairuotojų valdymas',
    'drivers.addNew': 'Pridėti vairuotoją',
    'drivers.totalDrivers': 'Iš viso vairuotojų',
    'drivers.activeDrivers': 'Aktyvūs vairuotojai',
    'drivers.pendingApproval': 'Laukia patvirtinimo',
    'drivers.avgRating': 'Vidutinis įvertinimas',
    'drivers.totalRides': 'Iš viso kelionių',
    'drivers.searchPlaceholder': 'Ieškoti pagal vardą, el. paštą, įmonę ar numerį...',
    'drivers.driver': 'Vairuotojas',
    'drivers.contactCompany': 'Kontaktai ir įmonė',
    'drivers.vehicle': 'Transporto priemonė',
    'drivers.performance': 'Veikla',
    'drivers.documents': 'Dokumentai',
    'drivers.offline': 'Neprisijungęs',
    
    // Client Management
    'clients.title': 'Klientų valdymas',
    'clients.addNew': 'Pridėti klientą',
    'clients.totalClients': 'Iš viso klientų',
    'clients.activeClients': 'Aktyvūs klientai',
    'clients.avgRating': 'Vidutinis įvertinimas',
    'clients.totalRides': 'Iš viso kelionių',
    'clients.totalRevenue': 'Bendros pajamos',
    'clients.searchPlaceholder': 'Ieškoti pagal vardą, el. paštą ar telefoną...',
    'clients.client': 'Klientas',
    'clients.contactAddress': 'Kontaktai ir adresas',
    'clients.activity': 'Veikla',
    'clients.spending': 'Išlaidos',
    'clients.preferences': 'Nuostatos',
    
    // Ride Management
    'rides.title': 'Kelionių valdymas',
    'rides.activeRides': 'Aktyvios kelionės',
    'rides.completedToday': 'Užbaigta šiandien',
    'rides.pendingRequests': 'Laukiančios užklausos',
    'rides.todaysRevenue': 'Šiandienos pajamos',
    'rides.searchPlaceholder': 'Ieškoti pagal kelionės ID, keleivį ar vairuotoją...',
    'rides.rideDetails': 'Kelionės detalės',
    'rides.route': 'Maršrutas',
    'rides.fare': 'Kaina',
    'rides.time': 'Laikas',
    'rides.ongoing': 'Vyksta',
    'rides.completed': 'Užbaigta',
    'rides.cancelled': 'Atšaukta',
    'rides.liveMapView': 'Žemėlapis realiu laiku',
    
    // Support Tickets
    'support.title': 'Pagalbos užklausos',
    'support.createTicket': 'Sukurti užklausą',
    'support.openTickets': 'Atviros užklausos',
    'support.inProgress': 'Vykdoma',
    'support.resolvedToday': 'Išspręsta šiandien',
    'support.avgResponseTime': 'Vidutinis atsako laikas',
    'support.searchPlaceholder': 'Ieškoti užklausų pagal ID, temą ar vartotoją...',
    'support.ticket': 'Užklausa',
    'support.user': 'Vartotojas',
    'support.category': 'Kategorija',
    'support.priority': 'Prioritetas',
    'support.assignee': 'Atsakingas',
    'support.resolved': 'Išspręsta',
    'support.closed': 'Uždaryta',
    
    // System Config
    'config.title': 'Sistemos konfigūracija',
    'config.saveAll': 'Išsaugoti visus pakeitimus',
    'config.geofencing': 'Geografinės zonos',
    'config.surgeZones': 'Padidinto tarifo zonos',
    'config.notifications': 'Pranešimai',
    'config.localization': 'Lokalizacija',
    
    // Audit Logs
    'audit.title': 'Audito žurnalas',
    'audit.exportLogs': 'Eksportuoti žurnalus',
    'audit.todaysActions': 'Šiandienos veiksmai',
    'audit.highSeverity': 'Aukštas svarbumo lygis',
    'audit.failedLogins': 'Nesėkmingi prisijungimai',
    'audit.activeSessions': 'Aktyvūs seansai',
    'audit.searchPlaceholder': 'Ieškoti pagal vartotoją, veiksmą ar tikslą...',
    'audit.timestamp': 'Laikas',
    'audit.action': 'Veiksmas',
    'audit.target': 'Tikslas',
    'audit.details': 'Detalės',
    'audit.severity': 'Svarbumo lygis',
    
    // Header
    'header.searchPlaceholder': 'Ieškoti vartotojų, kelionių, užklausų...',
    'header.lastLogin': 'Paskutinis prisijungimas',
    'header.today': 'Šiandien',
    'header.switchTheme': 'Perjungti į {mode} režimą',
    'header.light': 'šviesų',
    'header.dark': 'tamsų',
    
    // Footer
    'footer.superAdmin': 'Super administratorius',
    'footer.adminEmail': 'admin@taxifinder.com'
  },

  et: {
    // Navigation
    'nav.dashboard': 'Juhtpaneel',
    'nav.users': 'Kasutajate haldus',
    'nav.companies': 'Ettevõtted',
    'nav.drivers': 'Juhid',
    'nav.clients': 'Kliendid',
    'nav.rides': 'Sõitude haldus',
    'nav.support': 'Tugiteenuse päringud',
    'nav.config': 'Süsteemi seadistused',
    'nav.audit': 'Auditi logi',
    
    // Common
    'common.search': 'Otsi',
    'common.filter': 'Filter',
    'common.actions': 'Tegevused',
    'common.status': 'Staatus',
    'common.active': 'Aktiivne',
    'common.inactive': 'Mitteaktiivne',
    'common.suspended': 'Blokeeritud',
    'common.pending': 'Ootel',
    'common.all': 'Kõik',
    'common.add': 'Lisa',
    'common.edit': 'Muuda',
    'common.delete': 'Kustuta',
    'common.save': 'Salvesta',
    'common.cancel': 'Tühista',
    'common.view': 'Vaata',
    'common.export': 'Ekspordi',
    'common.refresh': 'Värskenda',
    'common.previous': 'Eelmine',
    'common.next': 'Järgmine',
    'common.showing': 'Näidatakse',
    'common.to': 'kuni',
    'common.of': 'kokku',
    'common.results': 'tulemust',
    
    // Dashboard
    'dashboard.title': 'Juhtpaneel',
    'dashboard.activeUsers': 'Aktiivsed kasutajad',
    'dashboard.activeDrivers': 'Aktiivsed juhid',
    'dashboard.dailyRevenue': 'Päevane tulu',
    'dashboard.openTickets': 'Avatud päringud',
    'dashboard.weeklyPerformance': 'Nädala jõudlus',
    'dashboard.recentActivity': 'Viimane tegevus',
    'dashboard.liveTracking': 'Sõitude jälgimine reaalajas',
    'dashboard.activeRides': 'Aktiivsed sõidud',
    'dashboard.availableDrivers': 'Saadaolevad juhid',
    
    // User Management
    'users.title': 'Kasutajate haldus',
    'users.addNew': 'Lisa kasutaja',
    'users.searchPlaceholder': 'Otsi nime, e-posti või telefoni järgi...',
    'users.allUsers': 'Kõik kasutajad',
    'users.drivers': 'Juhid',
    'users.riders': 'Reisijad',
    'users.contact': 'Kontakt',
    'users.type': 'Tüüp',
    'users.rating': 'Hinnang',
    'users.rides': 'Sõidud',
    
    // Company Management
    'companies.title': 'Ettevõtete haldus',
    'companies.addNew': 'Lisa ettevõte',
    'companies.totalCompanies': 'Ettevõtteid kokku',
    'companies.activeCompanies': 'Aktiivsed ettevõtted',
    'companies.totalDrivers': 'Juhte kokku',
    'companies.monthlyRevenue': 'Kuu tulu',
    'companies.searchPlaceholder': 'Otsi ettevõtte nime, e-posti või kontaktisiku järgi...',
    'companies.company': 'Ettevõte',
    'companies.contact': 'Kontakt',
    'companies.drivers': 'Juhid',
    'companies.performance': 'Jõudlus',
    
    // Driver Management
    'drivers.title': 'Juhtide haldus',
    'drivers.addNew': 'Lisa juht',
    'drivers.totalDrivers': 'Juhte kokku',
    'drivers.activeDrivers': 'Aktiivsed juhid',
    'drivers.pendingApproval': 'Ootab kinnitust',
    'drivers.avgRating': 'Keskmine hinnang',
    'drivers.totalRides': 'Sõite kokku',
    'drivers.searchPlaceholder': 'Otsi nime, e-posti, ettevõtte või numbri järgi...',
    'drivers.driver': 'Juht',
    'drivers.contactCompany': 'Kontakt ja ettevõte',
    'drivers.vehicle': 'Sõiduk',
    'drivers.performance': 'Jõudlus',
    'drivers.documents': 'Dokumendid',
    'drivers.offline': 'Võrguühenduseta',
    
    // Client Management
    'clients.title': 'Klientide haldus',
    'clients.addNew': 'Lisa klient',
    'clients.totalClients': 'Kliente kokku',
    'clients.activeClients': 'Aktiivsed kliendid',
    'clients.avgRating': 'Keskmine hinnang',
    'clients.totalRides': 'Sõite kokku',
    'clients.totalRevenue': 'Kogu tulu',
    'clients.searchPlaceholder': 'Otsi nime, e-posti või telefoni järgi...',
    'clients.client': 'Klient',
    'clients.contactAddress': 'Kontakt ja aadress',
    'clients.activity': 'Tegevus',
    'clients.spending': 'Kulutused',
    'clients.preferences': 'Eelistused',
    
    // Ride Management
    'rides.title': 'Sõitude haldus',
    'rides.activeRides': 'Aktiivsed sõidud',
    'rides.completedToday': 'Täna lõpetatud',
    'rides.pendingRequests': 'Ootel päringud',
    'rides.todaysRevenue': 'Tänane tulu',
    'rides.searchPlaceholder': 'Otsi sõidu ID, reisija või juhi järgi...',
    'rides.rideDetails': 'Sõidu üksikasjad',
    'rides.route': 'Marsruut',
    'rides.fare': 'Hind',
    'rides.time': 'Aeg',
    'rides.ongoing': 'Käimas',
    'rides.completed': 'Lõpetatud',
    'rides.cancelled': 'Tühistatud',
    'rides.liveMapView': 'Kaart reaalajas',
    
    // Support Tickets
    'support.title': 'Tugiteenuse päringud',
    'support.createTicket': 'Loo päring',
    'support.openTickets': 'Avatud päringud',
    'support.inProgress': 'Töötlemisel',
    'support.resolvedToday': 'Täna lahendatud',
    'support.avgResponseTime': 'Keskmine vastuse aeg',
    'support.searchPlaceholder': 'Otsi päringuid ID, teema või kasutaja järgi...',
    'support.ticket': 'Päring',
    'support.user': 'Kasutaja',
    'support.category': 'Kategooria',
    'support.priority': 'Prioriteet',
    'support.assignee': 'Vastutaja',
    'support.resolved': 'Lahendatud',
    'support.closed': 'Suletud',
    
    // System Config
    'config.title': 'Süsteemi seadistused',
    'config.saveAll': 'Salvesta kõik muudatused',
    'config.geofencing': 'Geograafilised tsoonid',
    'config.surgeZones': 'Kõrgendatud tariifi tsoonid',
    'config.notifications': 'Teavitused',
    'config.localization': 'Lokaliseerimine',
    
    // Audit Logs
    'audit.title': 'Auditi logi',
    'audit.exportLogs': 'Ekspordi logid',
    'audit.todaysActions': 'Tänased tegevused',
    'audit.highSeverity': 'Kõrge tähtsus',
    'audit.failedLogins': 'Ebaõnnestunud sisselogimised',
    'audit.activeSessions': 'Aktiivsed seansid',
    'audit.searchPlaceholder': 'Otsi kasutaja, tegevuse või sihtmärgi järgi...',
    'audit.timestamp': 'Aeg',
    'audit.action': 'Tegevus',
    'audit.target': 'Sihtmärk',
    'audit.details': 'Üksikasjad',
    'audit.severity': 'Tähtsus',
    
    // Header
    'header.searchPlaceholder': 'Otsi kasutajaid, sõite, päringuid...',
    'header.lastLogin': 'Viimane sisselogimine',
    'header.today': 'Täna',
    'header.switchTheme': 'Lülitu {mode} režiimile',
    'header.light': 'heledasse',
    'header.dark': 'tumedasse',
    
    // Footer
    'footer.superAdmin': 'Superadministraator',
    'footer.adminEmail': 'admin@taxifinder.com'
  },

  pl: {
    // Navigation
    'nav.dashboard': 'Panel kontrolny',
    'nav.users': 'Zarządzanie użytkownikami',
    'nav.companies': 'Firmy',
    'nav.drivers': 'Kierowcy',
    'nav.clients': 'Klienci',
    'nav.rides': 'Zarządzanie przejazdami',
    'nav.support': 'Zgłoszenia wsparcia',
    'nav.config': 'Konfiguracja systemu',
    'nav.audit': 'Dziennik audytu',
    
    // Common
    'common.search': 'Szukaj',
    'common.filter': 'Filtr',
    'common.actions': 'Akcje',
    'common.status': 'Status',
    'common.active': 'Aktywny',
    'common.inactive': 'Nieaktywny',
    'common.suspended': 'Zawieszony',
    'common.pending': 'Oczekujący',
    'common.all': 'Wszystkie',
    'common.add': 'Dodaj',
    'common.edit': 'Edytuj',
    'common.delete': 'Usuń',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.view': 'Zobacz',
    'common.export': 'Eksportuj',
    'common.refresh': 'Odśwież',
    'common.previous': 'Poprzedni',
    'common.next': 'Następny',
    'common.showing': 'Pokazuje',
    'common.to': 'do',
    'common.of': 'z',
    'common.results': 'wyników',
    
    // Dashboard
    'dashboard.title': 'Panel kontrolny',
    'dashboard.activeUsers': 'Aktywni użytkownicy',
    'dashboard.activeDrivers': 'Aktywni kierowcy',
    'dashboard.dailyRevenue': 'Dzienny przychód',
    'dashboard.openTickets': 'Otwarte zgłoszenia',
    'dashboard.weeklyPerformance': 'Wydajność tygodniowa',
    'dashboard.recentActivity': 'Ostatnia aktywność',
    'dashboard.liveTracking': 'Śledzenie przejazdów na żywo',
    'dashboard.activeRides': 'Aktywne przejazdy',
    'dashboard.availableDrivers': 'Dostępni kierowcy',
    
    // User Management
    'users.title': 'Zarządzanie użytkownikami',
    'users.addNew': 'Dodaj użytkownika',
    'users.searchPlaceholder': 'Szukaj po nazwie, e-mailu lub telefonie...',
    'users.allUsers': 'Wszyscy użytkownicy',
    'users.drivers': 'Kierowcy',
    'users.riders': 'Pasażerowie',
    'users.contact': 'Kontakt',
    'users.type': 'Typ',
    'users.rating': 'Ocena',
    'users.rides': 'Przejazdy',
    
    // Company Management
    'companies.title': 'Zarządzanie firmami',
    'companies.addNew': 'Dodaj firmę',
    'companies.totalCompanies': 'Łącznie firm',
    'companies.activeCompanies': 'Aktywne firmy',
    'companies.totalDrivers': 'Łącznie kierowców',
    'companies.monthlyRevenue': 'Miesięczny przychód',
    'companies.searchPlaceholder': 'Szukaj po nazwie firmy, e-mailu lub osobie kontaktowej...',
    'companies.company': 'Firma',
    'companies.contact': 'Kontakt',
    'companies.drivers': 'Kierowcy',
    'companies.performance': 'Wydajność',
    
    // Driver Management
    'drivers.title': 'Zarządzanie kierowcami',
    'drivers.addNew': 'Dodaj kierowcę',
    'drivers.totalDrivers': 'Łącznie kierowców',
    'drivers.activeDrivers': 'Aktywni kierowcy',
    'drivers.pendingApproval': 'Oczekuje zatwierdzenia',
    'drivers.avgRating': 'Średnia ocena',
    'drivers.totalRides': 'Łącznie przejazdów',
    'drivers.searchPlaceholder': 'Szukaj po nazwie, e-mailu, firmie lub numerze...',
    'drivers.driver': 'Kierowca',
    'drivers.contactCompany': 'Kontakt i firma',
    'drivers.vehicle': 'Pojazd',
    'drivers.performance': 'Wydajność',
    'drivers.documents': 'Dokumenty',
    'drivers.offline': 'Offline',
    
    // Client Management
    'clients.title': 'Zarządzanie klientami',
    'clients.addNew': 'Dodaj klienta',
    'clients.totalClients': 'Łącznie klientów',
    'clients.activeClients': 'Aktywni klienci',
    'clients.avgRating': 'Średnia ocena',
    'clients.totalRides': 'Łącznie przejazdów',
    'clients.totalRevenue': 'Łączny przychód',
    'clients.searchPlaceholder': 'Szukaj po nazwie, e-mailu lub telefonie...',
    'clients.client': 'Klient',
    'clients.contactAddress': 'Kontakt i adres',
    'clients.activity': 'Aktywność',
    'clients.spending': 'Wydatki',
    'clients.preferences': 'Preferencje',
    
    // Ride Management
    'rides.title': 'Zarządzanie przejazdami',
    'rides.activeRides': 'Aktywne przejazdy',
    'rides.completedToday': 'Ukończone dzisiaj',
    'rides.pendingRequests': 'Oczekujące żądania',
    'rides.todaysRevenue': 'Dzisiejszy przychód',
    'rides.searchPlaceholder': 'Szukaj po ID przejazdu, pasażerze lub kierowcy...',
    'rides.rideDetails': 'Szczegóły przejazdu',
    'rides.route': 'Trasa',
    'rides.fare': 'Opłata',
    'rides.time': 'Czas',
    'rides.ongoing': 'W trakcie',
    'rides.completed': 'Ukończony',
    'rides.cancelled': 'Anulowany',
    'rides.liveMapView': 'Mapa na żywo',
    
    // Support Tickets
    'support.title': 'Zgłoszenia wsparcia',
    'support.createTicket': 'Utwórz zgłoszenie',
    'support.openTickets': 'Otwarte zgłoszenia',
    'support.inProgress': 'W trakcie',
    'support.resolvedToday': 'Rozwiązane dzisiaj',
    'support.avgResponseTime': 'Średni czas odpowiedzi',
    'support.searchPlaceholder': 'Szukaj zgłoszeń po ID, temacie lub użytkowniku...',
    'support.ticket': 'Zgłoszenie',
    'support.user': 'Użytkownik',
    'support.category': 'Kategoria',
    'support.priority': 'Priorytet',
    'support.assignee': 'Przypisany',
    'support.resolved': 'Rozwiązane',
    'support.closed': 'Zamknięte',
    
    // System Config
    'config.title': 'Konfiguracja systemu',
    'config.saveAll': 'Zapisz wszystkie zmiany',
    'config.geofencing': 'Strefy geograficzne',
    'config.surgeZones': 'Strefy podwyższonych taryf',
    'config.notifications': 'Powiadomienia',
    'config.localization': 'Lokalizacja',
    
    // Audit Logs
    'audit.title': 'Dziennik audytu',
    'audit.exportLogs': 'Eksportuj dzienniki',
    'audit.todaysActions': 'Dzisiejsze akcje',
    'audit.highSeverity': 'Wysoka ważność',
    'audit.failedLogins': 'Nieudane logowania',
    'audit.activeSessions': 'Aktywne sesje',
    'audit.searchPlaceholder': 'Szukaj po użytkowniku, akcji lub celu...',
    'audit.timestamp': 'Czas',
    'audit.action': 'Akcja',
    'audit.target': 'Cel',
    'audit.details': 'Szczegóły',
    'audit.severity': 'Ważność',
    
    // Header
    'header.searchPlaceholder': 'Szukaj użytkowników, przejazdów, zgłoszeń...',
    'header.lastLogin': 'Ostatnie logowanie',
    'header.today': 'Dzisiaj',
    'header.switchTheme': 'Przełącz na tryb {mode}',
    'header.light': 'jasny',
    'header.dark': 'ciemny',
    
    // Footer
    'footer.superAdmin': 'Super Administrator',
    'footer.adminEmail': 'admin@taxifinder.com'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first, then browser language, then default to English
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ru', 'lv', 'lt', 'et', 'pl'].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('lv')) return 'lv';
    if (browserLang.startsWith('lt')) return 'lt';
    if (browserLang.startsWith('et')) return 'et';
    if (browserLang.startsWith('pl')) return 'pl';
    
    return 'en';
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};