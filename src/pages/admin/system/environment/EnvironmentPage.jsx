import { useState } from 'react';

import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import { AdminDetailSection } from '../../../../layouts/admin/AdminDetailLayout.jsx';
import AppToggle from '../../control/external/components/AppToggle.jsx';
import PageLayout from '../../control/components/PageLayout.jsx';
import '../../control/external/garim.css';

export default function EnvironmentPage() {
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [language, setLanguage] = useState('한국어');

  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <PageLayout gapClassName="gap-0" topPaddingClassName="pt-6">
        <div className="mx-auto w-full max-w-4xl pb-10 text-slate-900">
          <AdminDetailSection
            title="환경 설정"
            description="운영 알림 수신 여부와 기본 언어를 설정합니다."
          >
            <div className="divide-y divide-slate-100">
              <section className="flex items-center justify-between gap-5 py-4 first:pt-1">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">점검 및 업데이트 알림</h3>
                  <p className="mt-1 text-sm text-slate-500">시스템 변경 및 점검 예정 안내</p>
                </div>
                <AppToggle
                  checked={maintenanceAlerts}
                  onChange={() => setMaintenanceAlerts(current => !current)}
                  ariaLabel="점검 및 업데이트 알림"
                />
              </section>

              <section className="flex items-center justify-between gap-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">시스템 장애 알림</h3>
                  <p className="mt-1 text-sm text-slate-500">서비스 장애 발생 시 알림 수신</p>
                </div>
                <AppToggle
                  checked={incidentAlerts}
                  onChange={() => setIncidentAlerts(current => !current)}
                  ariaLabel="시스템 장애 알림"
                />
              </section>

              <label className="block py-4">
                <span className="mb-2 block text-sm font-semibold text-slate-800">기본 언어</span>
                <CustomDropdown
                  value={language}
                  onChange={setLanguage}
                  options={['한국어', 'English', '日本語']}
                  ariaLabel="기본 언어"
                  className="w-full [&>button]:h-11 [&>button]:rounded-full"
                />
              </label>
            </div>
          </AdminDetailSection>
        </div>
      </PageLayout>
    </div>
  );
}
