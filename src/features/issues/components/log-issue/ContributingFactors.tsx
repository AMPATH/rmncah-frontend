import './ContributingFactors.scss';

const delayLevels = ['1st', '2nd', '3rd'];

interface ContributingFactorsProps {
  delayFactors: Record<string, string[]>;
  selectedFactors: string[];
  onToggleFactor: (factor: string) => void;
}


function ContributingFactors({
  delayFactors,
  selectedFactors,
  onToggleFactor,
}: ContributingFactorsProps) {
  return (
    <fieldset className="contributing-factors">
      <legend>Contributing factors, by level of delay</legend>
      <div className="form-row">
        {delayLevels.map((level) => (
          <div key={level}>
            <p className="contributing-factors__heading">{level} delay</p>
            {delayFactors[level].length === 0 ? (
              <p className="empty-note">No factors set up yet.</p>
            ) : (
              delayFactors[level].map((factor) => (
                <label className="contributing-factors__checkbox" key={factor}>
                  <input
                    type="checkbox"
                    checked={selectedFactors.includes(factor)}
                    onChange={() => onToggleFactor(factor)}
                  />
                  {factor}
                </label>
              ))
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export default ContributingFactors;
