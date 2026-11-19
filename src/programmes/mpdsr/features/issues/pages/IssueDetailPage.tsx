import { useNavigate, useParams } from 'react-router';
import { Button, DataTableSkeleton, InlineNotification, Tag } from '@carbon/react';
import { Add, Edit } from '@carbon/icons-react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { can } from '../../../auth/permissions';
import { issuesInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import InfoList from '../../../components/shared/InfoList';
import RecommendationsTable from '../../overview/components/RecommendationsTable';
import { getIssues, getStoredRecommendations, toTableRow } from '../services/issueService';
import { getIssueEvents } from '../services/issueEditService';
import type { IssueEvent } from '../services/issueEditService';
import { formatDateTime, getToday } from '../../../utils/dates';
import { whyIssueBlocked } from '../utils/issueRules';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import './IssueDetailPage.scss';
import '../../recommendations/recommendations.scss';

const issueTypeLabels: Record<string, string> = {
  perinatal: 'Perinatal',
  maternal: 'Maternal',
  'near-miss': 'Near miss',
};

function orDash(value: string | undefined): string {
  return value && value.trim() !== '' ? value : '—';
}

function IssueDetailPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, users, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);

  const issue = issuesInScope(issuesData.data, scope).find((item) => item.code === code);
  const ofIssue = recommendationsData.data.filter((recommendation) => recommendation.issueId === issue?.id);
  const recommendations = ofIssue.map(toTableRow);
  const eventsData = useApiData<IssueEvent[]>(() => getIssueEvents(code), [], [code]);
  const nameOf = (id: string) => users.find((user) => user.id === id)?.fullName ?? 'Unknown user';

  if (issuesData.loading || recommendationsData.loading) {
    return <DataTableSkeleton columnCount={2} rowCount={8} showHeader={false} showToolbar={false} />;
  }

  if (!issue) {
    return (
      <div className="page">
        {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title="Issue not found"
          subtitle="It may not exist, or it was logged at a place outside your responsibility."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{issue.code}</h1>
          <p className="page-subtitle">
            {issueTypeLabels[issue.issueType] ?? issue.issueType} · {issue.loggedAt} · logged {issue.dateLogged}
          </p>
        </div>
        <div className="form-actions">
          {can(currentUser, 'recommendation.add') && !issue.cancelled && (
            <Button kind="tertiary" renderIcon={Edit} onClick={() => navigate(`/issues/${issue.code}/edit`)}>
              {whyIssueBlocked('edit', issue, currentUser, ofIssue, getToday()) === '' ? 'Edit or cancel' : 'Cancel issue'}
            </Button>
          )}
          {can(currentUser, 'recommendation.add') && !issue.cancelled && (
            <Button renderIcon={Add} onClick={() => navigate(`/issues/${issue.code}/recommendation`)}>
              Add recommendation
            </Button>
          )}
        </div>
      </div>

      {issue.cancelled && (
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title="This issue is cancelled"
          subtitle={issue.cancelReason ?? ''}
        />
      )}

      <div className="issue-detail">
        <section className="form-card">
          <h2 className="form-section-title">Case</h2>
          <InfoList
            items={[
              { label: 'Issue type', value: issueTypeLabels[issue.issueType] ?? issue.issueType },
              { label: 'Setting', value: orDash(issue.setting) },
              { label: 'Logged at', value: orDash(issue.loggedAt) },
              { label: 'Date of birth', value: orDash(issue.dateOfBirth) },
              { label: 'Gender', value: orDash(issue.gender) },
              { label: 'Cause of death', value: orDash(issue.causeOfDeath) },
              { label: 'Period of death', value: orDash(issue.periodOfDeath) },
              { label: 'Gestation (weeks)', value: orDash(issue.gestationWeeks) },
              { label: 'Days postpartum', value: orDash(issue.daysPostpartum) },
            ]}
          />
        </section>

        <section className="form-card">
          <h2 className="form-section-title">Dates</h2>
          <InfoList
            items={[
              { label: 'Date of death', value: orDash(issue.dateOfDeath) },
              { label: 'Date of notification', value: orDash(issue.dateOfNotification) },
              { label: 'Date of audit', value: orDash(issue.dateOfAudit) },
              { label: 'Date logged', value: issue.dateLogged },
            ]}
          />

          <h2 className="form-section-title issue-detail__subtitle">Contributing factors</h2>
          {issue.contributingFactors.length === 0 ? (
            <p className="empty-note">None recorded.</p>
          ) : (
            <div className="issue-detail__factors">
              {issue.contributingFactors.map((factor) => (
                <Tag key={factor} type="cool-gray">
                  {factor}
                </Tag>
              ))}
            </div>
          )}

          <h2 className="form-section-title issue-detail__subtitle">Comments</h2>
          <p className="issue-detail__comments">{orDash(issue.comments)}</p>
        </section>
      </div>

      {eventsData.data.length > 0 && (
        <section className="form-card issue-detail__history">
          <h2 className="form-section-title">Changes to this issue</h2>
          <ul className="recommendation-history">
            {eventsData.data.map((event) => (
              <li key={event.id}>
                <span className="recommendation-history__date">
                  {formatDateTime(event.at)} · {nameOf(event.byUserId)}
                </span>
                {event.action === 'cancelled' ? 'Cancelled' : 'Edited'}
                <span className="recommendation-history__note">{event.note}</span>
                {event.changes.map((change) => (
                  <span key={change.field} className="recommendation-history__date">
                    {change.field}: {change.from} → {change.to}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <RecommendationsTable
        recommendations={recommendations}
        description={`${recommendations.length} recommendation(s) for this issue. Open one to see its history and next steps.`}
      />
    </div>
  );
}

export default IssueDetailPage;
