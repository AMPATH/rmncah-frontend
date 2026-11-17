// The three levels of delay and their contributing factors (from the MPDSR workflow).
export interface DelayLevel {
  id: string;
  title: string;
  factors: string[];
}

export const delayLevels: DelayLevel[] = [
  {
    id: '1st',
    title: 'Personal or family',
    factors: [
      'Failure to recognize danger signs',
      'Ignorance of available services',
      'Cultural or religious reasons or objections',
      'Poverty',
      'Any other factor',
    ],
  },
  {
    id: '2nd',
    title: 'Access to skilled attendance',
    factors: [
      'Lack of transport from home to facility',
      'Lack of transport between facilities',
      'Lack of communication',
      'Long distance',
      'Poor roads',
      'Any other factor',
    ],
  },
  {
    id: '3rd',
    title: 'Quality of care',
    factors: [
      'Staff shortage',
      'Poor attitude',
      'Low morale',
      'Poor interpersonal relationship',
      'Language barrier',
      'Inadequate competencies and skills',
      'Lack of blood and blood products',
      'Lack of emergency or essential drugs',
      'Lack of theatre supplies',
      'Lack of equipment',
      'Inadequate critical care infrastructure',
    ],
  },
];
