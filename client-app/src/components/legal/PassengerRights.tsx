import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ScaleIcon, ShieldCheckIcon } from 'lucide-react';

interface RightsSectionProps {
  title: string;
  items: string[];
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

const RightsSection: React.FC<RightsSectionProps> = ({ 
  title, 
  items, 
  isExpanded, 
  onToggle, 
  icon 
}) => (
  <div className="border border-gray-200 rounded-lg mb-4">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
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

const PassengerRights: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rights: false,
    obligations: false,
    complaints: false,
    covid: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const passengerRights = [
    "Выбрать любое такси на стоянке независимо от порядка очереди",
    "Требовать предоставления чека об оплате поездки",
    "Получать услугу по справедливой цене согласно установленному тарифу",
    "Безопасная перевозка до места назначения",
    "Чистый салон автомобиля и вежливое обращение водителя",
    "Знать стоимость поездки заранее при заказе через приложение",
    "Получать информацию о маршруте и времени поездки",
    "Требовать включения счетчика (тарификатора)",
    "Подавать жалобы на некачественное обслуживание",
    "Защита прав потребителей согласно законодательству ЕС"
  ];

  const passengerObligations = [
    "Назвать конечный пункт или маршрут поездки при посадке",
    "Уплатить аванс за проезд, если водитель требует (дальние поездки)",
    "Занимать места согласно указаниям водителя",
    "Не отвлекать водителя во время движения",
    "Соблюдать общественный порядок в автомобиле-такси",
    "Согласовывать с водителем время и место остановок",
    "Оплатить стоимость поездки согласно тарифу",
    "При необходимости предъявить документы для льготного проезда",
    "Возместить ущерб при повреждении автомобиля",
    "Соблюдать санитарные требования (маска, дистанция)"
  ];

  const complaintsProcedure = [
    "Обратиться к водителю или диспетчеру службы такси",
    "Подать жалобу через мобильное приложение GoTaxi",
    "Обратиться в службу поддержки клиентов",
    "Связаться с муниципальной полицией при серьезных нарушениях",
    "Обратиться в Центр защиты прав потребителей",
    "Подать жалобу в Дорожную полицию при нарушении ПДД",
    "Обратиться в суд при значительном ущербе",
    "Использовать европейские механизмы защиты прав потребителей"
  ];

  const covidRequirements = [
    "Носить защитную маску в салоне автомобиля",
    "Занимать места как можно дальше от водителя",
    "Не садиться рядом с водителем (переднее сиденье)",
    "Соблюдать дистанцию при посадке и высадке",
    "Использовать бесконтактные способы оплаты",
    "Проветривать салон при необходимости",
    "Сообщать о симптомах заболевания",
    "Следовать рекомендациям Центра контроля заболеваний"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Права и обязанности пассажиров такси
        </h1>
        <p className="text-gray-600 text-sm">
          Согласно законодательству Латвии и требованиям Европейского Союза
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Важная информация</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Данная информация основана на действующем законодательстве Латвии. 
          Все услуги такси в Латвии регулируются государством и должны соответствовать 
          европейским стандартам качества и безопасности.
        </p>
      </div>

      <RightsSection
        title="✅ Ваши права как пассажира"
        items={passengerRights}
        isExpanded={expandedSections.rights}
        onToggle={() => toggleSection('rights')}
        icon={<ScaleIcon className="w-5 h-5 text-green-600" />}
      />

      <RightsSection
        title="❗ Ваши обязанности как пассажира"
        items={passengerObligations}
        isExpanded={expandedSections.obligations}
        onToggle={() => toggleSection('obligations')}
        icon={<ShieldCheckIcon className="w-5 h-5 text-orange-600" />}
      />

      <RightsSection
        title="📞 Как подать жалобу"
        items={complaintsProcedure}
        isExpanded={expandedSections.complaints}
        onToggle={() => toggleSection('complaints')}
        icon={<ScaleIcon className="w-5 h-5 text-red-600" />}
      />

      <RightsSection
        title="😷 Санитарные требования (COVID-19)"
        items={covidRequirements}
        isExpanded={expandedSections.covid}
        onToggle={() => toggleSection('covid')}
        icon={<ShieldCheckIcon className="w-5 h-5 text-purple-600" />}
      />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Контактная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700">Служба поддержки GoTaxi</h4>
            <p className="text-gray-600">Телефон: +371 2000 0000</p>
            <p className="text-gray-600">Email: support@gotaxi.lv</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Центр защиты прав потребителей</h4>
            <p className="text-gray-600">Телефон: +371 6722 3535</p>
            <p className="text-gray-600">Email: info@ptac.gov.lv</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Дорожная полиция</h4>
            <p className="text-gray-600">Телефон: 110 (экстренный)</p>
            <p className="text-gray-600">Телефон: +371 6718 2000</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Муниципальная полиция Риги</h4>
            <p className="text-gray-600">Телефон: +371 6703 1804</p>
            <p className="text-gray-600">Email: info@rmp.riga.lv</p>
          </div>
        </div>
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

export default PassengerRights;

