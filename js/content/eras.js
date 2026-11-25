/* =====================================================================
   eras.js — ALL the wording for the 0.7 journey layer. Edit here; nothing else holds copy.

   EVERYTHING IN THIS FILE IS A STAND-IN. Wording, "context" lines and profiles are drafts for Isabella to
   rewrite. No line is a quote from a real person. Facts about the web (dates, products) are general and
   should be checked against sources before they go in the written portion (see the Doc, "what to verify").

   SHAPE
   CFG                 two switches for the open decisions (going back, how many to keep)
   ARRIVAL             the disclosure + storyline shown once, before the first scene
   THINGS[eraKey]      2-4 explorable things per era: { id, title, kind, theme, line, ctx, poke:[button, result] }
   SCENES[eraKey]      the five transitions: { title, intro, why, fates:[...], reason, mote:[before, after] }
   FATES               what each kind of loss means, in plain words
   PROFILES            stand-in interviewee profiles, each with three links to things
   THEMES              the five plain categories a "system" can read from your choices
   NOUS                questions the 2030 guide asks instead of suggesting
   ===================================================================== */
(function () {
  'use strict';

  const CFG = {
    keep: 3,               // how many things you may keep at each transition
    perTransition: true,   // true: choose again at every transition. false: one budget of three for the whole journey
    allowBack: true,       // true: the era bar is free; going back to a lost thing finds a record, never the thing
    anchors: ['1993', '1999', '2006', '2010', '2024'],
    opaqueFrom: 2024,      // from this year the reason a thing is gone is no longer shown
  };

  const ARRIVAL = {
    title: 'hey, welcome in',
    story: [
      'this is a family computer that’s been around since 1991. every year up top is someone who forgot to log out.',
      'click around, open things, poke at stuff. every era has things to find.',
      'every so often the computer gets an upgrade, and you can only bring three things with you. the rest is up to the computer.',
    ],
    notes: [
      'the three things you pick each time, and how long you took to pick.',
      'anything you write or make here. it’s yours, so it can get lost too.',
      'your birth year, if you want to share it.',
      'all of it stays in this browser. no account, nothing sent anywhere. you can erase it whenever.',
      'the people and stories are stand-ins for now.',
    ],
    mote: [
      'hi! i’m mote. i live in here.',
      'this computer is going to change a lot. when it does, i can carry three things for you. you pick.',
    ],
    sticky: 'what this computer remembers:',
    begin: 'let’s go',
    free: 'just look around',
  };

  const THEMES = {
    making: 'making things',
    belonging: 'belonging to a group',
    play: 'play',
    keeping: 'keeping and collecting',
    voice: 'saying something in your own words',
  };

  /* ---------------- things: every era, each explorable ---------------- */
  const THINGS = {
    '1991': [
      { id: 'T-1991-first', title: 'the first page', kind: 'page', theme: 'making',
        line: 'a page explaining the web, written on the web.',
        ctx: 'The first web page described the project itself and how to use it. It had no images, no ads, and its author was the reader’s neighbour in the same building.',
        poke: ['follow a link', 'the link goes where its writer pointed it. nobody is told you followed it.'] },
      { id: 'T-1991-phone', title: 'a phone list', kind: 'directory', theme: 'keeping',
        line: 'a lab’s phone list, as linked text.',
        ctx: 'One of the first uses was ordinary: a phone directory anyone at the lab could search and link to. Useful first, grand later.',
        poke: ['look someone up', 'you find a name and a number. the list does not rank anyone.'] },
      { id: 'T-1991-editor', title: 'a browser that was also an editor', kind: 'tool', theme: 'making',
        line: 'reading and writing were one window.',
        ctx: 'The first browser could also edit pages. Later browsers mostly dropped that, and reading and writing became separate acts.',
        poke: ['change a word', 'you change a word on the page. it is yours to change. nothing asks if you are sure.'] },
      { id: 'T-1991-link', title: 'a link', kind: 'idea', theme: 'belonging',
        line: 'a promise from one document to another.',
        ctx: 'A link is made by whoever wrote the first document, to a second one they chose. There was no ranking of links yet.',
        poke: ['follow it', 'it takes you exactly where it says. the page you left does not know you left.'] },
    ],
    '1993': [
      { id: 'T-1993-pd', title: 'the public-domain notice', kind: 'document', theme: 'belonging',
        line: 'the code is given to everyone, for good.',
        ctx: 'In April 1993 the web’s code was released into the public domain. Anyone could build a browser or a server without asking or paying.',
        poke: ['read the notice', 'it is a few lines. it says anyone may use it. that is the whole thing.'] },
      { id: 'T-1993-hotlist', title: 'a hotlist', kind: 'list', theme: 'keeping',
        line: 'your list of places, on your machine.',
        ctx: 'Early browsers let you keep a list of favourite pages in a file on your own computer. It was yours, with no one ordering it.',
        poke: ['add a page', 'it joins the bottom of the list. the order is yours.'] },
      { id: 'T-1993-new', title: 'a “what’s new” list', kind: 'list', theme: 'belonging',
        line: 'a hand-kept list of new sites.',
        ctx: 'People kept lists of new sites by hand and sent in their own. A person decided what was on it, and you could write to them.',
        poke: ['submit a site', 'someone will read it. there is no queue score and no algorithm. only a person.'] },
    ],
    '1996': [
      { id: 'T-1996-guest', title: 'a guestbook', kind: 'page', theme: 'voice',
        line: 'visitors sign their names at the bottom.',
        ctx: 'Home pages often ended with a guestbook. Strangers wrote a line, the owner read them, and they stayed on the page.',
        poke: ['sign it', 'your line is added at the bottom with the date. you can write anything.'] },
      { id: 'T-1996-ring', title: 'a webring', kind: 'links', theme: 'belonging',
        line: 'pages that point to each other in a circle.',
        ctx: 'A webring linked small sites on the same theme. You could travel the ring and meet each owner’s page in turn.',
        poke: ['next site in the ring', 'you land on the next page in the ring. a person chose that neighbour.'] },
      { id: 'T-1996-uc', title: 'an “under construction” sign', kind: 'page', theme: 'making',
        line: 'a page that says it is not finished.',
        ctx: 'Pages announced they were unfinished and left them that way for years. Being unfinished was allowed.',
        poke: ['see what’s behind it', 'nothing is behind it. that is fine here.'] },
    ],
    '1999': [
      { id: 'T-1999-portal', title: 'a portal homepage', kind: 'page', theme: 'belonging',
        line: 'one page that wants to be your front door.',
        ctx: 'Portals bundled news, search, mail and weather into one page, hoping you would never leave. Your homepage became a business goal.',
        poke: ['make it my homepage', 'the page asks. you can say no, and for now it still works.'] },
      { id: 'T-1999-banner', title: 'a banner ad', kind: 'ad', theme: 'play',
        line: 'a rectangle that blinks at you.',
        ctx: 'Banner ads made attention something that could be counted and sold. Click-through rates became the first online metric most people met.',
        poke: ['click it', 'it counts the click. you did not agree to be counted, but it is counting.'] },
      { id: 'T-1999-mail', title: 'a free email signup', kind: 'form', theme: 'voice',
        line: 'free, if you make an account.',
        ctx: 'Free web mail asked for a name, a birth date and a password. It was one of the first times an account was the price of entry.',
        poke: ['read the form', 'it asks for six things. only two are needed for it to work.'] },
    ],
    '2004': [
      { id: 'T-2004-blog', title: 'a blog with comments', kind: 'page', theme: 'voice',
        line: 'posts, newest first, with replies underneath.',
        ctx: 'Blogs made publishing easy and put the newest post first. Comments let a reader answer the author, in public.',
        poke: ['leave a comment', 'your comment appears under the post, with your name if you choose one.'] },
      { id: 'T-2004-tags', title: 'a tag cloud', kind: 'list', theme: 'keeping',
        line: 'words people chose for the things they saved.',
        ctx: 'Tagging let people label things with their own words. The labels were messy and personal, and that was the point.',
        poke: ['click a tag', 'you see what other people filed under that word. nobody ranked them.'] },
      { id: 'T-2004-rss', title: 'an RSS feed', kind: 'feed', theme: 'making',
        line: 'you choose whose posts to read, in the order they were written.',
        ctx: 'A feed reader collected the sites you chose, in order, with no ranking added. You decided who was in it.',
        poke: ['subscribe', 'it adds the site to your reader. you can leave whenever. it does not notice.'] },
    ],
    '2006': [
      { id: 'T-2006-profile', title: 'a decorated profile', kind: 'page', theme: 'making',
        line: 'a profile page you could paste code into.',
        ctx: 'Social profiles in the mid-2000s could be restyled by hand: backgrounds, music, glitter. They were messy, personal and sometimes unreadable.',
        poke: ['change the background', 'it changes. nobody asks if it matches a template.'] },
      { id: 'T-2006-top8', title: 'a top eight', kind: 'list', theme: 'belonging',
        line: 'friends, ranked, in public.',
        ctx: 'Some profiles asked you to rank your friends in public. It made a quiet social fact visible, and sometimes painful.',
        poke: ['move someone down', 'they move down. they will be able to tell.'] },
      { id: 'T-2006-video', title: 'a first video upload', kind: 'video', theme: 'play',
        line: 'a short clip, shared with anyone.',
        ctx: 'Easy video sharing arrived around 2005. Ordinary people could publish moving pictures to strangers for the first time.',
        poke: ['press play', 'it plays. there is no “up next” yet.'] },
    ],
    '2008': [
      { id: 'T-2008-like', title: 'the like button', kind: 'control', theme: 'voice',
        line: 'a thumb, instead of a sentence.',
        ctx: 'The like button (2009 on the biggest network) made a reaction cost one click. Easier to give than a comment, and easier to count.',
        poke: ['press like', 'it adds one to a number. the person who wrote it sees a count, not your words.'] },
      { id: 'T-2008-status', title: 'a status box', kind: 'form', theme: 'voice',
        line: '“what’s on your mind?”',
        ctx: 'A single box asked everyone the same question all the time. Writing became something frequent, short and prompted.',
        poke: ['type something', 'the box accepts it and shows it to everyone you know, in a stream.'] },
      { id: 'T-2008-apps', title: 'an app grid', kind: 'tool', theme: 'play',
        line: 'a screen of small programs from a store.',
        ctx: 'Phone app stores arrived in 2008. Software became something chosen from a shelf run by the shelf’s owner.',
        poke: ['open one', 'it opens full screen. the rest of the web is somewhere else now.'] },
    ],
    '2010': [
      { id: 'T-2010-forum', title: 'a forum thread', kind: 'forum', theme: 'belonging',
        line: 'a long conversation among regulars.',
        ctx: 'Forums grouped people around a topic, with a thread you could follow for years. Regulars knew each other, and rules were set by moderators you could name.',
        poke: ['read the thread', 'it goes on for pages. the same people reply. it is slow, and it holds together.'] },
      { id: 'T-2010-photo', title: 'a filtered photo', kind: 'photo', theme: 'play',
        line: 'one tap, and it looks like a memory.',
        ctx: 'Photo apps added filters and a square crop. Sharing a picture got easier, and the look of everything started to match.',
        poke: ['apply a filter', 'the photo changes in one tap. the original is somewhere you rarely look.'] },
      { id: 'T-2010-trend', title: 'a trending list', kind: 'list', theme: 'keeping',
        line: 'what everyone is looking at, right now.',
        ctx: 'Trending lists showed popularity as news. The question shifted from “what do you care about?” to “what is everyone looking at?”',
        poke: ['open the top one', 'it opens. it does not say why it is on top beyond “popular”.'] },
    ],
    '2014': [
      { id: 'T-2014-badge', title: 'a notification badge', kind: 'control', theme: 'belonging',
        line: 'a red number that asks to be cleared.',
        ctx: 'Badges turned “something might be waiting” into a small itch. Clearing the number became its own task.',
        poke: ['clear it', 'it goes to zero. it comes back.'] },
      { id: 'T-2014-cookie', title: 'a cookie banner', kind: 'form', theme: 'keeping',
        line: 'a bar asking you to agree to be counted.',
        ctx: 'Rules in Europe led sites to ask permission to track. Most banners made the easy choice “accept” and the careful one a small maze.',
        poke: ['find “no”', 'it is behind a second screen and three toggles.'] },
      { id: 'T-2014-phone', title: 'a signup that wants your phone number', kind: 'form', theme: 'voice',
        line: 'to prove you’re real.',
        ctx: 'Signup flows began asking for a phone number, often with a reason like security. The number also worked as a permanent identifier.',
        poke: ['skip it', 'there is a “skip”, smaller and greyer than the button.'] },
    ],
    '2016': [
      { id: 'T-2016-feed', title: 'the ranked feed', kind: 'feed', theme: 'belonging',
        line: 'your friends, in an order you did not choose.',
        ctx: 'Major feeds switched from newest-first to ranked in 2016. What you saw depended on what the system predicted you would react to.',
        poke: ['scroll', 'there is more below. there is always more below.'] },
      { id: 'T-2016-auto', title: '“up next”', kind: 'video', theme: 'play',
        line: 'the next video starts in five seconds.',
        ctx: 'Autoplay removed the moment of deciding whether to keep watching. Stopping became the action that took effort.',
        poke: ['let it play', 'it plays. the next one is queued. nobody asked.'] },
      { id: 'T-2016-story', title: 'a story that vanishes', kind: 'photo', theme: 'making',
        line: 'a post that deletes itself in a day.',
        ctx: 'Stories made posts that disappear. It made posting feel lighter, and also made everything easier to lose.',
        poke: ['watch it', 'it plays once. in a day it will not be here. nobody keeps it for you.'] },
    ],
    '2024': [
      { id: 'T-2024-summary', title: 'an AI summary', kind: 'text', theme: 'voice',
        line: 'the article, shortened, above the article.',
        ctx: 'Summaries now sit in front of the thing they summarise. They are fast, and they flatten the author’s order, tone and hesitation.',
        poke: ['read the summary', 'it is clean and three sentences long. the author’s voice is not in it.'] },
      { id: 'T-2024-paywall', title: 'a paywall', kind: 'form', theme: 'keeping',
        line: 'you may read this if you subscribe.',
        ctx: 'A growing share of writing sits behind a plan. What you can find depends on what you pay, and often is not shown unless you pay.',
        poke: ['see the plans', 'three plans. none of them is the one that lets you read this one thing.'] },
      { id: 'T-2024-reply', title: 'a suggested reply', kind: 'control', theme: 'voice',
        line: 'three ready-made answers, one tap each.',
        ctx: 'Smart replies write the short answer for you. It is faster, and the sentence is no longer yours.',
        poke: ['tap one', 'it sends in your name. it sounds like everyone.'] },
    ],
    '2030': [
      { id: 'T-2030-catalog', title: 'your catalog', kind: 'record', theme: 'keeping',
        line: 'a list of what is yours, that you can read.',
        ctx: 'A speculative idea: a platform where your things sit in a catalog you can open, edit and take with you. Everything it holds is in plain words.',
        poke: ['open an entry', 'it shows who made it, where it lives, and how to take it back.'] },
      { id: 'T-2030-ask', title: 'a guide that asks', kind: 'tool', theme: 'voice',
        line: 'it asks a question and writes nothing for you.',
        ctx: 'A speculative idea: a helper that asks what you mean and leaves the writing to you. It is slower on purpose.',
        poke: ['answer it', 'your answer stays where you put it. the helper does not rewrite it.'] },
      { id: 'T-2030-return', title: 'a thing that comes back', kind: 'record', theme: 'making',
        line: 'something you let go of, found again.',
        ctx: 'A speculative idea: lost things leave a record you can read, with a reason that is true. Sometimes you can get the thing itself back.',
        poke: ['read the reason', 'the reason is written down: who decided, and when.'] },
    ],
  };

  /* ---------------- the five transitions ---------------- */
  const SCENES = {
    '1993': {
      slug: 'weather',
      mote: ['uh oh. the server room flooded. i can carry three things up the stairs. which ones?', 'that\u2019s it. no warning, nothing left behind. just bad weather.'], title: 'the weather',
      intro: 'a server gets wiped and a page nobody backed up is gone. nobody meant to. it just happened.',
      why: 'Early loss was accidental and unrecorded. Nothing is left to say it was ever there.',
      fates: ['gone'],
      reason: 'the server was overwritten; no copy was kept',
    },
    '1999': {
      slug: 'trust',
      mote: ['now the door wants a name and a password. it\u2019ll still let us in. mostly.', 'nothing got deleted. there\u2019s just a rope in front of it now.'], title: 'trust',
      intro: 'to get to some things you need an account now. they\u2019re still here, just not free.',
      why: 'Access became conditional on who you are willing to be known as. The thing is not deleted, only gated.',
      fates: ['gated', 'gone'],
      reason: 'it moved behind a sign-in; some were not moved',
    },
    '2006': {
      slug: 'pages',
      mote: ['everyone gets the same page now. it\u2019s tidier. it\u2019s also a lot smaller than what you made.', 'it kept your words, but not the way you said them.'], title: 'pages',
      intro: 'homemade pages turn into profiles in a template. you keep whatever fits in the boxes.',
      why: 'When a platform replaces a hand-made page with a template, the content survives and the form is flattened.',
      fates: ['degraded', 'gone'],
      reason: 'it did not fit the profile template',
    },
    '2010': {
      slug: 'feeds',
      mote: ['the forum is moving into the feed. the feed decides what goes on top.', 'your stuff is still in there somewhere. keep scrolling.'], title: 'forums into feeds',
      intro: 'the place where the regulars hung out turns into a feed. your things are still there, just shown the feed\u2019s way.',
      why: 'When conversations are moved into a ranked stream, the content is displaced by whatever the system would rather show.',
      fates: ['displaced', 'degraded'],
      reason: 'its place was taken by the stream',
    },
    '2024': {
      slug: 'writing',
      mote: ['it wants to write for you now. it\u2019s really fast. i\u2019m a little worried.', 'i asked why some of it\u2019s missing. it didn\u2019t say.'], title: 'writing',
      intro: 'the computer offers to write for you. what you wrote gets kept as its version, or not at all.',
      why: 'When a system drafts, summarises or rewrites, the original author is displaced. The reason for what is missing is no longer shown.',
      fates: ['displaced', 'gone', 'gated'],
      reason: '',   // from opaqueFrom on, no reason is shown
    },
  };

  const FATES = {
    here:      { label: 'kept', note: 'you brought this one with you!' },
    gone:      { label: 'gone', note: 'it didn\u2019t make it. all that\u2019s left is a note that it was here.' },
    degraded:  { label: 'flattened', note: 'kept, but only the part that fit. the colours, pictures and order are gone.' },
    gated:     { label: 'gated', note: 'still there, but you have to sign up or pay to see it.' },
    displaced: { label: 'displaced', note: 'something else sits where your thing was: the computer\u2019s version.' },
  };

  /* ---------------- stand-in interviewee profiles ---------------- */
  // Stand-ins only: composite, invented, no real details. Replace with consenting interviewees' own (named or not) words.
  const PROFILES = [
    { id: 'P-A', handle: 'stand-in A', note: 'for someone who built a home page and kept it up for years.',
      line: 'placeholder: wrote the page, signed the guestbook, kept it unfinished on purpose.', links: ['T-1996-guest', 'T-1996-uc', 'T-2006-profile'] },
    { id: 'P-B', handle: 'stand-in B', note: 'for someone who belonged to one forum for a long time.',
      line: 'placeholder: knew the regulars, followed the threads, watched the feed replace the forum.', links: ['T-2010-forum', 'T-1996-ring', 'T-2016-feed'] },
    { id: 'P-C', handle: 'stand-in C', note: 'for someone who writes slowly, and is offered shortcuts.',
      line: 'placeholder: writes drafts by hand, receives suggestions they didn’t ask for.', links: ['T-2004-blog', 'T-2024-reply', 'T-2030-ask'] },
    { id: 'P-D', handle: 'stand-in D', note: 'for someone who kept leaving platforms when they changed.',
      line: 'placeholder: keeps a list of places they’ve left, and why.', links: ['T-1993-hotlist', 'T-2014-cookie', 'T-2016-story'] },
  ];


  /* ---------------- one memory per era, and one question for the visitor ----------------
     "The more local something is, the more universal." Each era shows ONE specific memory and asks the
     visitor for theirs. memory: paraphrased from the two interviews (NOT quotes; check each with the speaker,
     get consent, then replace with their own words). ask: the question. label: its short name.
     flat: how a system would file the visitor's answer (shown when the answer is "displaced", and in the file). */
  const MEMORIES = {
    '1991': { label: 'the first computer', who: 'someone who was there', memory: 'The network was something you reached through a university or an office. You needed access, some technical nerve, and time to experiment.',
      ask: 'Where was the first computer you ever used, and whose was it?', flat: 'household · device ownership' },
    '1993': { label: 'who showed you', who: 'someone who was there', memory: 'He sat people down at a browser and showed them the weather in another country. That was the whole demonstration, and it was enough.',
      ask: 'Who first showed you something on the internet? What was it?', flat: 'social graph · early adopter contact' },
    '1996': { label: 'paper', who: 'someone who was there', memory: 'Work still ran on fax machines and physical paperwork. Things had to be printed, signed and sent.',
      ask: 'What did you (or your family) used to do on paper that now happens on a screen?', flat: 'lifestyle · analog to digital' },
    '1999': { label: 'the first purchase', who: 'someone who was there', memory: 'Typing a credit card number into a website felt like a real risk. The shop only sold books then.',
      ask: 'What was the first thing you or your family bought online? Was anyone nervous?', flat: 'commerce · first purchase · trust signal' },
    '2004': { label: 'a game you can’t open', who: 'someone who grew up online', memory: 'The Flash games are not outdated so much as unreachable. The thing they ran on is gone from ordinary computers.',
      ask: 'What is a game or a site you loved that you can’t open anymore?', flat: 'entertainment · legacy content' },
    '2006': { label: 'your first page', who: 'someone who grew up online', memory: 'A pet site and a profile page were where she first made something online that looked like her.',
      ask: 'What did your first profile or page look like? What was on it?', flat: 'identity · self-presentation' },
    '2008': { label: 'found again', who: 'someone who was there', memory: 'A social network let him find old friends he had lost touch with. That part was simply good.',
      ask: 'Who did the internet help you find again?', flat: 'social graph · reconnected tie' },
    '2010': { label: 'where they knew your name', who: 'both of them', memory: 'There were small forums for one narrow interest, with the same few people in them. Most of those are gone or empty now.',
      ask: 'What was a small corner of the internet where people knew your name?', flat: 'community · niche interest' },
    '2014': { label: 'left out', who: 'someone who was there', memory: 'When an essential service goes online-only, the older people he knows are the ones who can no longer do it themselves.',
      ask: 'Who in your life gets left out when something becomes “online only”?', flat: 'household · dependent · accessibility' },
    '2016': { label: 'locked', who: 'someone who grew up online', memory: 'Doing research for work, she keeps meeting two internets: what is free, and the better thing behind a payment.',
      ask: 'What is something you wanted to read and couldn’t, because it was paid or locked?', flat: 'intent · unconverted · price sensitive' },
    '2024': { label: 'a blank page', who: 'someone who grew up online', memory: 'She is a good writer, and she almost never starts from a blank page now. She talks, and the machine tidies it.',
      ask: 'What is the last thing you wrote entirely by yourself, starting from nothing?', flat: 'content · user-generated · low volume' },
    '2030': { label: 'handed back', who: 'someone who grew up online', memory: 'She made herself a tool that asks her questions back, because she wanted to keep doing the thinking.',
      ask: 'What would you want handed back to you, with your name on it?', flat: '' },
  };

  /* ---------------- two rooms, built from the two interviews ----------------
     Stand-ins. Each object in a room is one memory from MEMORIES (paraphrased, not quoted). Before showing
     publicly: each person checks their room, chooses how they appear, and supplies their own words. */
  const ROOMS = [
    { id: 'R-there', who: 'someone who was there', sub: 'on the network before it had pictures', look: 'office',
      intro: 'a desk in an office, early nineties. a beige monitor, a fax machine, a lot of paper.',
      objects: [{ icon: '🖥️', era: '1993', label: 'the monitor', toy: 'weather' }, { icon: '📠', era: '1996', label: 'the fax machine' }, { icon: '💳', era: '1999', label: 'a credit card' }, { icon: '👥', era: '2008', label: 'an old photograph' }, { icon: '☎️', era: '2014', label: 'a phone that still has buttons' }] },
    { id: 'R-grew', who: 'someone who grew up online', sub: 'the family computer was already there', look: 'bedroom',
      intro: 'a bedroom desk, mid two-thousands. a shared family computer, stickers on the tower, homework somewhere.',
      objects: [{ icon: '🎮', era: '2004', label: 'a game that won’t open' }, { icon: '🐾', era: '2006', label: 'her first page' }, { icon: '🔒', era: '2016', label: 'a locked article' }, { icon: '📄', era: '2024', label: 'a blank page', toy: 'blank' }, { icon: '❓', era: '2030', label: 'a tool that asks back' }] },
  ];

  // act names in the aesthetic windows that count as MAKING something (it becomes yours, and can be lost)
  const MAKES = ['launch', 'release', 'upload', 'sign', 'publish', 'submit', 'hang', 'case', 'file', 'post', 'write', 'record', 'screenshot', 'diary', 'lookbook', 'repost', 'session', 'commons', 'outfit'];

  /* ---------------- 2030: a guide that asks ---------------- */
  const NOUS = [
    'who is this for, and what would you want them to feel?',
    'what in this is the part you least want to say, and should it stay unsaid?',
    'is there a word here you would only use with them?',
  ];

  // a tiny, honest "suggestion" rule set used in 2024 (displaced writing). Plain rules, no model. Shown in the UI.
  const POLISH = [
    [/\b(i think|maybe|perhaps|sort of|kind of|i guess|just)\b\s*/gi, ''],
    [/\b(sorry|apologies)\b[,.]?\s*/gi, ''],
    [/\s{2,}/g, ' '],
  ];

  window.TS_CONTENT = { CFG, ARRIVAL, THEMES, THINGS, SCENES, FATES, PROFILES, NOUS, POLISH, MEMORIES, MAKES, ROOMS };
})();
