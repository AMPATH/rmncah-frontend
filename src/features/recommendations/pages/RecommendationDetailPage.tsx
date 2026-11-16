import { useParams } from 'react-router';
import { DataTableSkeleton } from '@carbon/react';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import InfoList from '../../../components/shared/InfoList';
import StatusTag from '../../../components/shared/StatusTag';
import { useRecommendation } from '../hooks/useRecommendation';
import LifecycleBar from '../components/LifecycleBar';
import RecommendationActions from '../components/RecommendationActions';
import RecommendationHistory from '../components/RecommendationHistory';
import RecommendationNotFound from '../components/RecommendationNotFound';
import '../recommendations.scss';

const classificationLabels: Record<string, string> = {
  immediate: 'Immediate (1 month)',
  intermediate: 'Intermediate (3 months)',
  'long-term': 'Long term (6 months)',
};

// One recommendation: where it is in its lifecycle, its details, its history,
// and what the current user can do next. Opened from a row in the Action plan.
function RecommendationDetailPage() {
  const { code = '' } = useParams();
  const { currentUser, users } = useCurrentUser();
  const { recommendation, issue, events, loading, failed } = useRecommendation(code);

  const holder = users.find((user) => user.id === recommendation?.responsiblePersonId);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{code}</h1>
          <p className="page-subtitle">Recommendation</p>
        </div>
      </div>

      {failed && <ApiErrorNotice />}

      {loading ? (
        <DataTableSkeleton columnCount={2} rowCount={6} showHeader={false} showToolbar={false} />
      ) : !recommendation ? (
        <RecommendationNotFound />
      ) : (
        <>
          <LifecycleBar
            status={recommendation.status}
            needsAcceptance={
              recommendation.level === 'sub-county' ||
              recommendation.level === 'county' ||
              recommendation.status === 'Pending acceptance' ||
              events.some((event) => event.toStatus === 'Pending acceptance')
            }
          />

          <div className="recommendation-detail">
            <section className="form-card">
              <h2 className="form-section-title">Details</h2>
              <p className="recommendation-detail__text">{recommendation.text}</p>
              <InfoList
                items={[
                  { label: 'Status', value: <StatusTag status={recommendation.status} /> },
                  { label: 'Linked issue', value: recommendation.issueCode },
                  { label: 'Logged at', value: issue?.loggedAt || '—' },
                  { label: 'Gap identified', value: recommendation.gap || '—' },
                  { label: 'Responsible person', value: holder ? `${holder.fullName} (${holder.cadre})` : '—' },
                  { label: 'Level of implementation', value: recommendation.level },
                  {
                    label: 'Classification',
                    value: classificationLabels[recommendation.classification] ?? recommendation.classification,
                  },
                  { label: 'Due date', value: recommendation.dueDate },
                  { label: 'Date logged', value: recommendation.dateLogged },
                  { label: 'Times redone', value: recommendation.timesRedone },
                ]}
              />
            </section>

            <section className="form-card">
              <h2 className="form-section-title">What happens next</h2>
              <RecommendationActions recommendation={recommendation} user={currentUser} />

              <h2 className="form-section-title recommendation-detail__history-title">History</h2>
              <RecommendationHistory recommendation={recommendation} events={events} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default RecommendationDetailPage;
