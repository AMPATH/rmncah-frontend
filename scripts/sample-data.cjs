// Fills mpdsrdb.json with sample issues, recommendations, history and notifications,
// from about six months ago up to today. Users, locations, causes of death and the
// escalation matrix are kept. The current file is copied to mpdsrdb.before-sample.json first.
// Run with: node scripts/sample-data.cjs
const fs = require('fs');

const DB = 'mpdsrdb.json';
const BACKUP = 'mpdsrdb.before-sample.json';
const ISSUE_COUNT = 160;
const DAYS_BACK = 180;

// A fixed seed gives the same data every run.
let seed = 20261123;
function random() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (low, high) => low + Math.floor(random() * (high - low + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const chance = (probability) => random() < probability;
function pickWeighted(entries) {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

const pad = (value) => String(value).padStart(2, '0');
function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function addDays(day, days) {
  const [year, month, date] = day.split('-').map(Number);
  return isoDate(new Date(year, month - 1, date + days));
}
function addMonths(day, months) {
  const [year, month, date] = day.split('-').map(Number);
  return isoDate(new Date(year, month - 1 + months, date));
}
function stamp(day) {
  return `${day}T${pad(between(7, 17))}:${pad(between(0, 59))}:00.000Z`;
}
const earliest = (a, b) => (a < b ? a : b);

if (!fs.existsSync(DB)) {
  console.log(`${DB} not found. Start the app once (npm run dev) so it is created, then run this again.`);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
fs.copyFileSync(DB, BACKUP);

const today = isoDate(new Date());
const users = (db.users || []).filter((user) => user.active !== false && user.deleted !== true);
const byRole = (role) => users.filter((user) => user.role === role);
const chps = byRole('CHP');
const reporters = byRole('FACILITY_REPORTER');
const chairs = byRole('FACILITY_CHAIR');
const pcns = byRole('PCN_COORDINATOR');
const subCountyLeads = byRole('SUBCOUNTY_COORDINATOR');
const countyLeads = byRole('COUNTY_SURVEILLANCE_LEAD');
const locations = db.locations || [];
const parentOf = Object.fromEntries(locations.map((location) => [location.name, location.parent]));
const at = (list, place) => list.filter((user) => (user.assignedLocations || []).includes(place));

// Only facilities with their own reporter and MPDSR chair get issues, so every record has a real owner.
const facilities = locations.filter(
  (location) => location.type === 'facility' && at(reporters, location.name).length && at(chairs, location.name).length
);

if (facilities.length === 0) {
  console.log('You need at least one facility with its own facility reporter and facility MPDSR chair.');
  process.exit(1);
}

// The people who can hold a recommendation at each level, for one facility.
function peopleFor(facilityName, communityUnit) {
  const subCounty = parentOf[facilityName];
  const county = parentOf[subCounty];
  return {
    community: communityUnit ? at(chps, communityUnit) : [],
    facility: [...at(reporters, facilityName), ...at(chairs, facilityName)],
    'sub-county': [...at(subCountyLeads, subCounty), ...at(pcns, subCounty)],
    county: at(countyLeads, county),
  };
}

// Bring in any causes of death from the seed that this file does not have yet (for example perinatal ones).
const seedCauses = fs.existsSync('db.seed.json') ? JSON.parse(fs.readFileSync('db.seed.json', 'utf8')).causesOfDeath || [] : [];
db.causesOfDeath = db.causesOfDeath || [];
for (const cause of seedCauses) {
  if (!db.causesOfDeath.some((existing) => existing.name === cause.name && existing.appliesTo === cause.appliesTo)) {
    db.causesOfDeath.push({ ...cause, id: db.causesOfDeath.some((existing) => existing.id === cause.id) ? `${cause.id}-s` : cause.id });
  }
}
const causes = db.causesOfDeath;
const causeName = (cause) => (cause.code ? `${cause.code} · ${cause.name}` : cause.name);
const causesFor = (type) =>
  causes.filter((cause) => cause.active !== false && (cause.appliesTo === type || cause.appliesTo === 'all')).map(causeName);

const delays = {
  '1st': ['Failure to recognize danger signs', 'Ignorance of available services', 'Cultural or religious reasons or objections', 'Poverty'],
  '2nd': ['Lack of transport from home to facility', 'Lack of transport between facilities', 'Lack of communication', 'Long distance', 'Poor roads'],
  '3rd': [
    'Staff shortage',
    'Poor attitude',
    'Low morale',
    'Inadequate competencies and skills',
    'Lack of blood and blood products',
    'Lack of emergency or essential drugs',
    'Lack of theatre supplies',
    'Lack of equipment',
    'Inadequate critical care infrastructure',
  ],
};

const actionsFor = {
  'Failure to recognize danger signs': 'Hold monthly danger sign sessions for mothers at antenatal clinic',
  'Ignorance of available services': 'Run community barazas on maternity services available at the facility',
  'Cultural or religious reasons or objections': 'Engage local religious and community leaders on skilled delivery',
  Poverty: 'Link mothers to Linda Mama and NHIF registration at first antenatal visit',
  'Lack of transport from home to facility': 'Set up a boda boda referral scheme with the community unit',
  'Lack of transport between facilities': 'Make the ambulance available around the clock for obstetric referrals',
  'Lack of communication': 'Provide an airtime-loaded phone for referral calls in the maternity ward',
  'Long distance': 'Map mothers more than 10 km away and plan birth preparedness early',
  'Poor roads': 'Raise the road condition with the sub-county roads office',
  'Staff shortage': 'Roster a second midwife on night shifts',
  'Poor attitude': 'Hold respectful maternity care training for maternity staff',
  'Low morale': 'Introduce a monthly staff recognition and support meeting',
  'Inadequate competencies and skills': 'Run EmONC skills drills every month',
  'Lack of blood and blood products': 'Agree a blood supply arrangement with the county blood bank',
  'Lack of emergency or essential drugs': 'Keep a stocked PPH and eclampsia emergency tray in labour ward',
  'Lack of theatre supplies': 'Review theatre stock weekly and reorder early',
  'Lack of equipment': 'Request a working vacuum extractor and resuscitation set',
  'Inadequate critical care infrastructure': 'Set up a high dependency bed in the maternity ward',
};

const comments = [
  'Referred late from the community.',
  'Mother arrived in critical condition.',
  'Family delayed seeking care.',
  'Discussed at the facility MPDSR meeting.',
  '',
  '',
];

const issues = [];
const recommendations = [];
const recommendationEvents = [];
const issueEvents = [];
const notifications = [];
let nextId = 1;
const newId = (prefix) => `${prefix}${String(nextId++).padStart(4, '0')}`;

function notify(recipientId, day, message, code, category, from = 'System') {
  if (!recipientId || day > today) return;
  notifications.push({
    id: newId('n'),
    recipientId,
    date: day,
    at: stamp(day),
    message,
    recommendationId: code,
    from,
    category,
    read: day < addDays(today, -7) ? true : chance(0.4),
  });
}

function event(code, day, byUserId, action, fromStatus, toStatus, note = '') {
  recommendationEvents.push({ id: newId('e'), code, at: stamp(day), byUserId, action, fromStatus, toStatus, note });
}

// Spread the issues over the period, with more in recent weeks so the trackers have something to show.
const loggedDays = [];
for (let index = 0; index < ISSUE_COUNT; index += 1) {
  if (index < 6) loggedDays.push(today);
  else if (index < 45) loggedDays.push(addDays(today, -between(1, 14)));
  else loggedDays.push(addDays(today, -between(15, DAYS_BACK)));
}
loggedDays.sort();

const counters = {};
loggedDays.forEach((dateLogged, index) => {
  const issueType = pickWeighted([['perinatal', 5], ['maternal', 3], ['near-miss', 2]]);
  const facility = pick(facilities);
  const units = locations.filter(
    (location) => location.type === 'community-unit' && location.parent === facility.name && at(chps, location.name).length
  );
  const community = issueType !== 'near-miss' && units.length > 0 && chance(0.3);
  const unit = community ? pick(units).name : '';
  const loggedAt = community ? unit : facility.name;
  const logger = community ? pick(at(chps, unit)) : pick(at(reporters, facility.name));
  const peopleAtLevel = peopleFor(facility.name, unit);
  const year = dateLogged.slice(0, 4);
  counters[year] = (counters[year] ?? 0) + 1;
  const code = `ISS-${year}-${String(counters[year]).padStart(4, '0')}`;

  const isDeath = issueType !== 'near-miss';
  const dateOfDeath = isDeath ? addDays(dateLogged, -between(1, 10)) : '';
  const dateOfNotification = isDeath ? earliest(addDays(dateOfDeath, between(0, 2)), dateLogged) : addDays(dateLogged, -between(0, 3));
  const periodOfDeath = isDeath ? pickWeighted([['antenatal', 1], ['intrapartum', 2], ['postpartum', 3]]) : '';
  // Every issue has at least one factor in each level of delay, and one recommendation for each.
  const factors = [];
  const gaps = [];
  for (const level of Object.keys(delays)) {
    const picked = [];
    const howMany = between(1, 2);
    while (picked.length < howMany) {
      const factor = pick(delays[level]);
      if (!picked.includes(factor)) picked.push(factor);
    }
    factors.push(...picked.map((factor) => `${level} delay: ${factor}`));
    gaps.push({ gap: `${level} delay: ${picked.join('; ')}`, first: picked[0] });
  }
  const cause = isDeath ? pick(causesFor(issueType).length ? causesFor(issueType) : ['']) : '';

  const issue = {
    id: newId('i'),
    code,
    setting: community ? 'community' : 'facility',
    loggedAt,
    issueType,
    dateOfBirth:
      issueType === 'perinatal' && dateOfDeath
        ? addDays(dateOfDeath, -between(0, 7))
        : `${between(1982, 2006)}-${pad(between(1, 12))}-${pad(between(1, 28))}`,
    gender: issueType === 'perinatal' ? pick(['female', 'male']) : 'female',
    causeOfDeath: cause,
    periodOfDeath,
    gestationWeeks: periodOfDeath === 'antenatal' || periodOfDeath === 'intrapartum' ? String(between(28, 41)) : '',
    daysPostpartum: periodOfDeath === 'postpartum' ? String(between(0, 42)) : '',
    dateOfDeath,
    dateOfNotification,
    dateOfAudit: dateLogged,
    contributingFactors: factors,
    comments: pick(comments),
    loggedById: logger.id,
    dateLogged,
  };

  const chair = pick(at(chairs, facility.name));
  const age = Math.round((new Date(today) - new Date(dateLogged)) / 86400000);
  // Issues and recommendations are never cancelled.
  const reviewed = age >= 3 && (age > 14 || chance(0.5));

  let reviewDate = '';
  if (reviewed) {
    reviewDate = earliest(addDays(dateLogged, between(2, 10)), today);
    issue.review = {
      reviewDate,
      finalCause: cause,
      completedAt: stamp(reviewDate),
      completedById: chair.id,
    };
    issueEvents.push({ id: newId('h'), issueCode: code, at: stamp(reviewDate), byUserId: chair.id, action: 'reviewed', note: `Case review on ${reviewDate}`, changes: [] });
    notify(logger.id, reviewDate, `${chair.fullName} reviewed ${code} with no changes to what you logged.`, code, 'reviewed', chair.fullName);
  } else {
    notify(chair.id, dateLogged, `${code} was logged and is waiting for your case review`, code, 'review-needed');
  }
  issues.push(issue);

  gaps.forEach(({ gap, first }, position) => {
    const recCode = `${code}-R${position + 1}`;
    // The classification and date of completion are set by the chair at the case review.
    const classification = reviewed ? pickWeighted([['immediate', 3], ['intermediate', 2], ['long-term', 1]]) : '';
    const months = { immediate: 1, intermediate: 3, 'long-term': 6 }[classification];
    const dueDate = reviewed ? addDays(addMonths(reviewDate, months), -between(0, 10)) : '';
    const recommendation = {
      id: newId('r'),
      code: recCode,
      issueId: issue.id,
      issueCode: code,
      gap,
      text: actionsFor[first] ?? 'Follow up the gap at the next MPDSR meeting',
      classification,
      level: '',
      responsiblePersonId: '',
      dateOfCompletion: dueDate,
      dueDate,
      status: 'Pending review',
      timesRedone: 0,
      dateLogged,
    };
    recommendations.push(recommendation);

    if (!reviewed) return;

    const levelChoices = [['facility', 5], ['sub-county', 2], ['county', 2]];
    if (issueType !== 'near-miss') levelChoices.push(['community', 1]);
    let level = pickWeighted(levelChoices.filter(([value]) => peopleAtLevel[value].length > 0));
    let holder = pick(peopleAtLevel[level]);

    let needsAcceptance = level === 'sub-county' || level === 'county';
    let status = needsAcceptance ? 'Pending acceptance' : 'Open';
    event(recCode, reviewDate, chair.id, 'released', 'Pending review', status);
    notify(
      holder.id,
      reviewDate,
      needsAcceptance ? 'New recommendation needs your acceptance within 3 days' : 'New recommendation assigned to you',
      recCode,
      needsAcceptance ? 'acceptance-needed' : 'assigned'
    );

    // Some facility work is escalated up to the sub-county, which then has to accept it.
    const escalateDay = addDays(reviewDate, 1);
    if (level === 'facility' && peopleAtLevel['sub-county'].length && escalateDay < addDays(today, -2) && chance(0.15)) {
      const from = holder;
      level = 'sub-county';
      holder = pick(peopleAtLevel['sub-county']);
      event(recCode, escalateDay, from.id, 'escalated', status, 'Pending acceptance', 'Needs sub-county funding to carry out');
      notify(holder.id, escalateDay, 'A recommendation was moved to you and needs your acceptance within 3 days', recCode, 'escalated');
      status = 'Pending acceptance';
      needsAcceptance = true;
    }
    recommendation.level = level;
    recommendation.responsiblePersonId = holder.id;

    const sinceRelease = Math.round((new Date(today) - new Date(reviewDate)) / 86400000);
    if (needsAcceptance && sinceRelease <= 2) {
      recommendation.status = status;
      return;
    }

    const acceptedDay = earliest(addDays(reviewDate, between(1, 2)), today);
    if (needsAcceptance || chance(0.9)) {
      event(recCode, acceptedDay, holder.id, 'accepted', status, 'In progress');
      status = 'In progress';
    }

    const chairName = chair.fullName;
    if (dueDate < today) {
      const outcome = pickWeighted([['closed', 6], ['overdue', 3], ['awaiting', 1]]);
      if (outcome === 'overdue') {
        event(recCode, addDays(dueDate, 1), 'system', 'marked-overdue', status, 'Overdue', `Due date ${dueDate} passed before completion.`);
        notify(holder.id, addDays(dueDate, 1), 'A recommendation assigned to you is overdue', recCode, 'overdue');
        status = 'Overdue';
      } else {
        const doneDay = earliest(addDays(dueDate, -between(1, 10)), today);
        if (outcome === 'closed' && chance(0.25)) {
          event(recCode, doneDay, holder.id, 'marked-done', status, 'Pending approval', 'Work done');
          event(recCode, addDays(doneDay, 1), chair.id, 'rejected', 'Pending approval', 'In progress', 'Attach the attendance list as evidence');
          notify(holder.id, addDays(doneDay, 1), 'Your completed work was rejected: Attach the attendance list as evidence', recCode, 'rejected', chairName);
        }
        const finalDone = outcome === 'closed' ? earliest(addDays(doneDay, between(1, 3)), dueDate) : earliest(addDays(dueDate, -1), today);
        event(recCode, finalDone, holder.id, 'marked-done', 'In progress', 'Pending approval', 'Completed as planned');
        notify(chair.id, finalDone, 'Completed work is waiting for your approval', recCode, 'approval-needed');
        status = 'Pending approval';
        if (outcome === 'closed') {
          const approvedDay = earliest(addDays(finalDone, between(1, 4)), today);
          event(recCode, approvedDay, chair.id, 'approved', 'Pending approval', 'Closed', '');
          notify(holder.id, approvedDay, 'Your completed work was approved', recCode, 'approved', chairName);
          status = 'Closed';
        }
      }
    } else if (status === 'In progress') {
      const outcome = pickWeighted([['running', 5], ['awaiting', 2], ['closed', 2], ['rejected', 1]]);
      if (outcome === 'rejected' && acceptedDay < addDays(today, -1)) {
        const doneDay = addDays(acceptedDay, 1);
        event(recCode, doneDay, holder.id, 'marked-done', 'In progress', 'Pending approval', 'Training held');
        event(recCode, addDays(doneDay, 1), chair.id, 'rejected', 'Pending approval', 'In progress', 'Attach the attendance list as evidence');
        notify(holder.id, addDays(doneDay, 1), 'Your completed work was rejected: Attach the attendance list as evidence', recCode, 'rejected', chair.fullName);
      } else if (outcome !== 'running' && outcome !== 'rejected' && acceptedDay < today) {
        const doneDay = addDays(acceptedDay, between(1, Math.max(1, Math.round((new Date(today) - new Date(acceptedDay)) / 86400000))));
        const finalDone = earliest(doneDay, today);
        event(recCode, finalDone, holder.id, 'marked-done', 'In progress', 'Pending approval', 'Completed ahead of the due date');
        notify(chair.id, finalDone, 'Completed work is waiting for your approval', recCode, 'approval-needed');
        status = 'Pending approval';
        if (outcome === 'closed' && finalDone < today) {
          const approvedDay = earliest(addDays(finalDone, 1), today);
          event(recCode, approvedDay, chair.id, 'approved', 'Pending approval', 'Closed', '');
          notify(holder.id, approvedDay, 'Your completed work was approved', recCode, 'approved', chairName);
          status = 'Closed';
        }
      }
    }
    recommendation.status = status;
  });
});

db.issues = issues;
db.recommendations = recommendations;
db.recommendationEvents = recommendationEvents;
db.issueEvents = issueEvents;
db.notifications = notifications.sort((a, b) => (a.at < b.at ? 1 : -1));
db.evidence = [];
fs.writeFileSync(DB, JSON.stringify(db, null, 2) + '\n');

const count = (list, test) => list.filter(test).length;
console.log(`Saved ${DB}. Your previous data is in ${BACKUP}.`);
console.log(`Issues: ${issues.length} (maternal ${count(issues, (i) => i.issueType === 'maternal')}, perinatal ${count(issues, (i) => i.issueType === 'perinatal')}, near miss ${count(issues, (i) => i.issueType === 'near-miss')}, reviewed ${count(issues, (i) => i.review)})`);
const statuses = {};
for (const recommendation of recommendations) statuses[recommendation.status] = (statuses[recommendation.status] ?? 0) + 1;
console.log(`Recommendations: ${recommendations.length} (${Object.entries(statuses).map(([status, total]) => `${status} ${total}`).join(', ')})`);
console.log(`History events: ${recommendationEvents.length + issueEvents.length}, notifications: ${notifications.length}`);