
import AdminPageHeader from '../components/shared/AdminPageHeader'
import AdminStatus from '../components/shared/AdminStatus'
import { systemSettings } from '../data/adminData'

import '../styles/SystemConfigurationPage.scss'

interface SystemConfigurationPageProps {
  title: string
}

function SystemConfigurationPage({
  title,
}: SystemConfigurationPageProps) {
  const categories = Array.from(
    new Set(systemSettings.map((setting) => setting.category)),
  )

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={title}
        description="Review the general settings and integration configuration of the platform."
      />

      <div className="admin-demo-notice">
        Demonstration configuration. Changes are not connected to production settings.
      </div>

      <div className="admin-config-layout">
        <nav className="admin-config-nav" aria-label="Configuration sections">
          {categories.map((category) => (
            <a href={`#config-${category.toLowerCase()}`} key={category}>
              {category}
            </a>
          ))}
        </nav>

        <div className="admin-config-content">
          {categories.map((category) => (
            <section
              className="admin-panel"
              id={`config-${category.toLowerCase()}`}
              key={category}
            >
              <div className="admin-panel__header">
                <div>
                  <h2>{category}</h2>
                  <p>Current demonstration settings.</p>
                </div>
              </div>

              <div className="admin-settings-list">
                {systemSettings
                  .filter((setting) => setting.category === category)
                  .map((setting) => (
                    <div className="admin-setting-row" key={setting.id}>
                      <div>
                        <strong>{setting.label}</strong>
                        <p>{setting.description}</p>
                      </div>
                      <div className="admin-setting-value">
                        {setting.value === 'Not connected' ? (
                          <AdminStatus value="Inactive" />
                        ) : (
                          <span>{setting.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}

          <section className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Integration overview</h2>
                <p>Integration connection states must be verified by backend services.</p>
              </div>
            </div>

            <div className="admin-integration-row">
              <div>
                <strong>Email notification service</strong>
                <p>Email delivery configuration</p>
              </div>
              <AdminStatus value="Not connected" />
            </div>

            <div className="admin-integration-row">
              <div>
                <strong>Authentication service</strong>
                <p>Identity and access management</p>
              </div>
              <AdminStatus value="Not verified" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default SystemConfigurationPage
