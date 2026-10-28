import PageLayout from '../../control/components/PageLayout.jsx';

export default function NoticesPage() {
  return (
    <PageLayout>
      <section>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">운영 공지</h1>
        <p className="mt-2 text-sm text-slate-500">
          시스템 점검, 장애 안내와 신규 기능 소식을 관리합니다.
        </p>
      </section>
    </PageLayout>
  );
}
