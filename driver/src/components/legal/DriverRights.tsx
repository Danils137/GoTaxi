import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CarIcon, ShieldCheckIcon, DocumentTextIcon, AlertTriangleIcon } from 'lucide-react';

interface RightsSectionProps {
  title: string;
  items: string[];
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  bgColor?: string;
}

const RightsSection: React.FC<RightsSectionProps> = ({ 
  title, 
  items, 
  isExpanded, 
  onToggle, 
  icon,
  bgColor = "bg-gray-50"
}) => (
  <div className="border border-gray-200 rounded-lg mb-4">
    <button
      onClick={onToggle}
      className={`w-full px-4 py-3 flex items-center justify-between ${bgColor} hover:opacity-90 rounded-t-lg transition-colors`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      {isExpanded ? (
        <ChevronUpIcon className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronDownIcon className="w-5 h-5 text-gray-600" />
      )}
    </button>
    
    {isExpanded && (
      <div className="px-4 py-3 bg-white">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const DriverRights: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rights: false,
    obligations: false,
    licensing: false,
    technical: false,
    language: false,
    penalties: false,
    covid: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const driverRights = [
    "Требовать оплату согласно установленному тарифу",
    "Отказаться от поездки в случае неадекватного поведения пассажира",
    "Требовать предварительную оплату при дальних поездках (свыше 50 км)",
    "Отказаться от поездки при угрозе безопасности",
    "Требовать соблюдения правил поведения в салоне",
    "Вызвать службы экстренного реагирования при необходимости",
    "Получать справедливую оплату за услуги",
    "Работать в удобное время (при работе на себя)",
    "Защита трудовых прав согласно законодательству ЕС",
    "Получать поддержку от платформы GoTaxi"
  ];

  const driverObligations = [
    "Быть зарегистрированным в Реестре водителей такси (AD)",
    "Иметь действующие водительские права категории B",
    "Иметь опыт вождения не менее 3 лет",
    "Пройти медицинское освидетельствование",
    "Вежливо обращаться с пассажирами",
    "Предоставлять чек об оплате по требованию",
    "Соблюдать установленные тарифы",
    "Знать город и оптимальные маршруты",
    "Содержать автомобиль в чистоте и исправном состоянии",
    "Соблюдать Правила дорожного движения"
  ];

  const licensingRequirements = [
    "Подача заявления в Дорожную администрацию (AD)",
    "Предоставление медицинской справки",
    "Подтверждение опыта вождения (не менее 3 лет)",
    "Прохождение проверки знания города",
    "Оплата государственной пошлины",
    "Получение удостоверения водителя такси",
    "Ежегодное продление лицензии",
    "Прохождение периодических медосмотров",
    "Уведомление об изменении данных",
    "Соблюдение условий лицензии"
  ];

  const technicalRequirements = [
    "Автомобиль не старше 10 лет (для новых лицензий)",
    "Прохождение технического осмотра каждые 6 месяцев",
    "Наличие тарификатора (счетчика)",
    "Установка опознавательных знаков такси",
    "Наличие огнетушителя и аптечки",
    "Исправная работа всех систем автомобиля",
    "Чистота салона и внешнего вида",
    "Наличие детских кресел (по запросу)",
    "Система GPS для отслеживания",
    "Терминал для безналичной оплаты"
  ];

  const languageRequirements = [
    "Владение латышским языком на среднем уровне (B2)",
    "Умение общаться с пассажирами на государственном языке",
    "Знание основных фраз на английском языке",
    "Понимание русского языка (желательно)",
    "Прохождение языкового тестирования",
    "Получение справки о знании языка",
    "Периодическое подтверждение языковых навыков",
    "Изучение профессиональной терминологии"
  ];

  const penalties = [
    "Штраф 280-700€ за работу без лицензии",
    "Лишение права работы в такси на срок до 2 лет",
    "Штраф 140-280€ за нарушение тарифов",
    "Штраф 70-140€ за отсутствие тарификатора",
    "Административная ответственность за нарушение ПДД",
    "Уголовная ответственность за серьезные нарушения",
    "Конфискация автомобиля при повторных нарушениях",
    "Штраф 35-70€ за неопрятный внешний вид автомобиля"
  ];

  const covidRequirements = [
    "Проветривать и дезинфицировать автомобиль после каждого клиента",
    "Носить защитную маску во время работы",
    "Отделять передние сиденья от задних (при необходимости)",
    "Предоставлять дезинфицирующие средства пассажирам",
    "Соблюдать дистанцию при общении с пассажирами",
    "Регулярно проходить тестирование на COVID-19",
    "Сообщать о симптомах заболевания",
    "Следовать рекомендациям Центра контроля заболеваний"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Права и обязанности водителей такси
        </h1>
        <p className="text-gray-600 text-sm">
          Согласно законодательству Латвии и требованиям Европейского Союза
        </p>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Важное уведомление</h3>
        </div>
        <p className="text-yellow-700 text-sm">
          Работа водителем такси в Латвии требует обязательного лицензирования. 
          Нарушение требований может повлечь серьезные штрафы и лишение права работы.
        </p>
      </div>

      <RightsSection
        title="✅ Ваши права как водителя"
        items={driverRights}
        isExpanded={expandedSections.rights}
        onToggle={() => toggleSection('rights')}
        icon={<ShieldCheckIcon className="w-5 h-5 text-green-600" />}
        bgColor="bg-green-50"
      />

      <RightsSection
        title="❗ Ваши обязанности как водителя"
        items={driverObligations}
        isExpanded={expandedSections.obligations}
        onToggle={() => toggleSection('obligations')}
        icon={<DocumentTextIcon className="w-5 h-5 text-orange-600" />}
        bgColor="bg-orange-50"
      />

      <RightsSection
        title="📋 Лицензирование и регистрация"
        items={licensingRequirements}
        isExpanded={expandedSections.licensing}
        onToggle={() => toggleSection('licensing')}
        icon={<DocumentTextIcon className="w-5 h-5 text-blue-600" />}
        bgColor="bg-blue-50"
      />

      <RightsSection
        title="🔧 Технические требования к автомобилю"
        items={technicalRequirements}
        isExpanded={expandedSections.technical}
        onToggle={() => toggleSection('technical')}
        icon={<CarIcon className="w-5 h-5 text-purple-600" />}
        bgColor="bg-purple-50"
      />

      <RightsSection
        title="🗣️ Языковые требования"
        items={languageRequirements}
        isExpanded={expandedSections.language}
        onToggle={() => toggleSection('language')}
        icon={<DocumentTextIcon className="w-5 h-5 text-indigo-600" />}
        bgColor="bg-indigo-50"
      />

      <RightsSection
        title="⚖️ Штрафы и ответственность"
        items={penalties}
        isExpanded={expandedSections.penalties}
        onToggle={() => toggleSection('penalties')}
        icon={<AlertTriangleIcon className="w-5 h-5 text-red-600" />}
        bgColor="bg-red-50"
      />

      <RightsSection
        title="😷 Санитарные требования (COVID-19)"
        items={covidRequirements}
        isExpanded={expandedSections.covid}
        onToggle={() => toggleSection('covid')}
        icon={<ShieldCheckIcon className="w-5 h-5 text-teal-600" />}
        bgColor="bg-teal-50"
      />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Контактная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700">Дорожная администрация (AD)</h4>
            <p className="text-gray-600">Телефон: +371 6702 0000</p>
            <p className="text-gray-600">Email: info@csdd.lv</p>
            <p className="text-gray-600">Адрес: Rīga, S.Eizenšteina iela 6</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Центр государственного языка</h4>
            <p className="text-gray-600">Телефон: +371 6722 6390</p>
            <p className="text-gray-600">Email: info@valoda.lv</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Дорожная полиция</h4>
            <p className="text-gray-600">Телефон: 110 (экстренный)</p>
            <p className="text-gray-600">Телефон: +371 6718 2000</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Поддержка GoTaxi</h4>
            <p className="text-gray-600">Телефон: +371 2000 0001</p>
            <p className="text-gray-600">Email: driver@gotaxi.lv</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Полезные ссылки</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <a href="https://www.csdd.lv" className="underline">Дорожная администрация - csdd.lv</a></li>
          <li>• <a href="https://www.valoda.lv" className="underline">Центр государственного языка - valoda.lv</a></li>
          <li>• <a href="https://likumi.lv" className="underline">Законодательство Латвии - likumi.lv</a></li>
          <li>• <a href="https://www.spkc.gov.lv" className="underline">Центр контроля заболеваний - spkc.gov.lv</a></li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Последнее обновление: {new Date().toLocaleDateString('lv-LV')} | 
          Версия: 1.0 | 
          Источник: Законодательство Латвии и требования ЕС
        </p>
      </div>
    </div>
  );
};

export default DriverRights;

