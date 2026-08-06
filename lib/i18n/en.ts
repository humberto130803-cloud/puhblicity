/** English source strings. `es.ts` mirrors this shape exactly. */
export const en = {
  meta: {
    title: "PUHBLICITY — name your price. Do the thing.",
    description:
      "You say what you'll do. The internet decides what it's worth. Hit your target and you're paid — miss it and every backer gets their SOL back, all of it.",
    createTitle: "Post a dare — PUHBLICITY",
    moneyTitle: "How the money works — PUHBLICITY",
    termsTitle: "Terms — PUHBLICITY",
    privacyTitle: "Privacy — PUHBLICITY",
    offlineTitle: "Offline — PUHBLICITY",
  },

  nav: {
    board: "The board",
    money: "How the money works",
    mine: "My dares",
    admin: "Admin",
    connect: "Connect wallet",
    signingIn: "Signing in…",
    langLabel: "Language",
  },

  footer: {
    blurb:
      "We hold the pot until a dare settles. We're a small operation, not a bank. The 5 SOL ceiling is there for a reason. 18+.",
    terms: "Terms",
    privacy: "Privacy",
  },

  home: {
    live: (open: number, sol: string) =>
      `${open} ${open === 1 ? "dare" : "dares"} open · ${sol} SOL in play right now`,
    h1a: "Name your",
    h1b: "price. Do",
    h1c: "the thing.",
    sub: "You say what you'll do. The internet decides what it's worth. Hit your target and you're paid — miss it and every backer gets their SOL back, all of it.",
    post: "Post your dare",
    seeOpen: "See what's open",
    rule1t: "You go first",
    rule1b: "Nobody can dare you.",
    rule2t: "5 SOL ceiling",
    rule2b: "The number stops.",
    rule3t: "Full refunds",
    rule3b: "No target, no charge.",
    paidSoFar: "Paid out to doers so far",
    daresDone: (n: number) => `${n} ${n === 1 ? "dare" : "dares"} done`,
    openNow: (n: number) => `${n} open right now`,
    scroll: "Scroll to the board",
    paused:
      "Nothing new opens until we're back. Money already pledged is safe — refunds and payouts keep running.",
    pausedTitle: "Paused.",
    stepsEyebrow: "Start to finish",
    steps: [
      { t: "You post", b: "Pick a dare from the menu, set your target and a deadline. 0.02 SOL to post." },
      { t: "People back it", b: "The pot climbs in public. Anyone can watch, anyone can add." },
      { t: "Target hits", b: "Funding closes on the spot. You get 48 hours." },
      { t: "You send proof", b: "One video. We check it, usually within a few hours." },
      { t: "You're paid", b: "Pot minus our 10% lands in your wallet. Miss any step and backers are refunded in full." },
    ],
  },

  board: {
    eyebrow: "The board",
    heading: "Open right now",
    filters: { all: "All", closing: "Closing soon", nearly: "Nearly funded", fresh: "Just posted" },
    emptyTitle: "Nothing open right now.",
    elseTitle: "Nothing else open right now.",
    emptySub: "Somebody has to go first. It costs 0.02 SOL to post.",
    funded: "Funded — waiting on proof",
    wall: "The wall — done and paid",
  },

  card: {
    backThis: "Back this",
    seeIt: "See it",
    backers: (n: number) => `${n} ${n === 1 ? "backer" : "backers"}`,
    ofTarget: (pct: number, target: string) => `${pct}% of ${target} target`,
    proofUp: "▶ Proof is up — watch it",
    proofDue: "proof due",
    foot: {
      IN_REVIEW: "in review",
      PAID: "paid out",
      REFUNDING: "refunding",
      REFUNDED: "refunded",
      KILLED: "removed",
    } as Record<string, string>,
  },

  status: {
    OPEN: "Open",
    CLOSED: "Funded — proof due",
    IN_REVIEW: "In review",
    PAID: "Paid out",
    REFUNDING: "Refunding",
    REFUNDED: "Refunded in full",
    KILLED: "Removed",
  } as Record<string, string>,

  dare: {
    postedBy: "Posted by",
    doneBy: "Done by",
    verified: "✓ verified",
    unconfirmed: "(unconfirmed)",
    flaggedTitle: "Waiting for a quick human check",
    flaggedBody:
      "before it goes on the board. Only you can see it right now — usually minutes.",
    proofMeans: "What counts as proof",
    proofRejected:
      "If the proof doesn't match the dare, it's rejected and every backer is refunded.",
    codeRule: (name: string, id: string) =>
      `${name} also has to open the video by saying or showing the dare code ${id} — so nobody can pass off a video they didn't film for this.`,
    noteFrom: (name: string) => `Note from ${name}`,
    comesDownIn: "This comes down in",
    comesDownTail: "— proof videos are deleted 48 hours after payout.",
    videoGoneTitle: "The video has come down.",
    videoGoneBody:
      "It was up for 48 hours after payout, then deleted — that's the deal we make with everyone who films themselves for this. The payout below is still on-chain and still checkable.",
    whatHappened: "What happened",
    refundsSent: "Refunds sent",
    backersTitle: "Backers",
    backersMade: "Backers who made it happen",
    noBackers: "Nobody yet. First name on the wall gets remembered.",
    inThePot: "In the pot",
    toGo: (amount: string) => `${amount} SOL to go`,
    targetHit: "Target hit — funding closed",
    ceiling: "ceiling 5.00",
    target: (a: string) => `target ${a}`,
    closesIn: "Closes in",
    ifHits: "If it hits target",
    ifHitsVal: (name: string) => `${name} has 48h to prove it`,
    ifNot: "If it doesn't",
    ifNotVal: "Everyone refunded in full",
    backCta: "Back this dare",
    connectToBack: "Connect to back this",
    pausedTitle: "Paused.",
    pausedBody: "No new pledges right now. Money already in is safe.",
    minNote:
      "Minimum 0.05 SOL. Pledges are final while a dare is open. Pledge from your own wallet — sends from an exchange lose the tag and we can't match them.",
    headsUp: "Heads up.",
    inFlight:
      "If this closes while your transaction is in flight, we send your SOL straight back — usually inside a minute.",
    prevRejected: "Previous proof rejected:",
    statusLbl: "Status",
    waitingProof: "Waiting on proof",
    proofInReview: "Proof in review",
    proofDueIn: "Proof due in",
    potLbl: "Pot",
    doerGets: (name: string) => `${name} gets`,
    afterCut: (a: string) => `${a} after our 10%`,
    sendProof: "Send your proof",
    replaceProof: "Replace your proof",
    receipt: "Settlement receipt",
    paidStamp: "Paid",
    platformCut: "Platform cut (10%)",
    paidTo: (name: string) => `Paid to ${name}`,
    settled: "Settled",
    transaction: "Transaction",
    yourTurn: "Your turn.",
    yourTurnBody: (name: string, target: string) =>
      `${name} set a ${target} target and cleared it. Posting costs 0.02 SOL.`,
    finalTote: "Final tote",
    refundedFull: (a: string) => `${a} SOL — 100%`,
    refundedLbl: "Refunded",
    deducted: "Deducted",
    nothing: "Nothing",
    closed: "Closed",
    missingTitle: "Didn't get yours?",
    missingBody:
      "Refunds land within a few minutes. If yours hasn't after an hour, send us the transaction and we'll chase it by hand.",
    reportMissing: "Report a missing refund",
    tryAgain: "Try again",
    tryAgainBody:
      "Lower target, longer window, and post it when your people are awake. Most dares that fail are priced above their audience.",
    postAgain: "Post it again",
    theProof: "The proof",
  },

  reasons: {
    killed:
      "This dare broke the rules and was removed. Every pledge goes back to the wallet it came from — the full amount, no fee deducted.",
    rejected: (why: string) =>
      `The proof didn't pass review: "${why}". Every pledge goes back to the wallet it came from — the full amount, no fee deducted.`,
    noProof:
      "The target was hit, but proof never arrived inside the 48-hour window. Every pledge goes back to the wallet it came from — the full amount, no fee deducted.",
    missedTarget: (pot: string, target: string) =>
      `The deadline passed with ${pot} SOL in the pot against a ${target} target. Every pledge went back to the wallet it came from — the full amount, no fee deducted.`,
    tail: (name: string) =>
      `${name} keeps nothing and the 0.02 posting fee isn't returned.`,
    refundingNow: "Refunds are going out now — they usually land within minutes.",
  },

  backModal: {
    eyebrow: "Backing",
    howMuch: "How much",
    finishIt: (a: string) => `${a} — finish it`,
    saySomething: "Say something (optional)",
    notePlaceholder: "do it without water",
    yourPledge: "Your pledge",
    networkFee: "Network fee",
    potAfter: "Pot after this",
    closes: " — closes",
    crosses: (name: string, amount: string) =>
      `This pledge takes the dare past its target, so funding closes the moment it lands. ${name} gets 48 hours to send proof. If proof doesn't come, or we reject it, you get all ${amount} back.`,
    submit: (a: string) => `Back with ${a} SOL`,
    waiting: "Waiting on your wallet…",
    approve: "Your wallet will ask you to approve. Pledges are final while a dare is open.",
    badAmount: "That amount doesn't parse. Plain numbers, like 0.1.",
    belowMin: "Minimum pledge is 0.05 SOL.",
    broke: "Something broke. Nothing left your wallet unless it says so.",
  },

  create: {
    eyebrow: "Post a dare",
    heading: "What will you do?",
    lede: "Pick from the menu. You can't invent one — the menu is how we keep this fun instead of dangerous.",
    theDare: "The dare",
    count: (n: number) =>
      `${n} of them. They're built to be hard to fake — a stranger has to react, or it's one unbroken take, or it leaves something anyone can check afterwards.`,
    groups: {
      Nerve: "Nerve",
      Looks: "Looks",
      Taste: "Taste",
      Body: "Body",
      Online: "Online",
    } as Record<string, string>,
    groupBlurbs: {
      Nerve: "Strangers have to be there. That's the whole difficulty.",
      Looks: "You change something and live with it for a while.",
      Taste: "One serving. Unpleasant, never unsafe.",
      Body: "Short, measurable, and visibly hard.",
      Online: "The screenshot is the proof.",
    } as Record<string, string>,
    banned:
      "Nothing involving heights, vehicles, fire, alcohol, drugs, or anyone who hasn't agreed to be in it. That's the whole moderation policy, built into the menu.",
    specifics: "Your specifics",
    specificsHint:
      "The bit that makes it yours. Keep it about you — no links, no phone numbers, nobody else's name.",
    specificsPlaceholder:
      "No milk on the table. My roommate films it and she is not going to help me.",
    target: "Your target",
    targetHint:
      "The least you'll do it for. Under this by the deadline and everyone's refunded.",
    targetRule:
      "Between 0.25 and 5.00 SOL. The ceiling is 5 and it does not move. Low targets fill — that's how you get on the board.",
    window: "Funding window",
    windows: { h24: "24 hours", d3: "3 days", d7: "7 days" },
    nameHandle: "Your name and handle",
    namePlaceholder: "Your name on the board",
    igPlaceholder: "@instagram (optional)",
    walletHint:
      "Payouts go to the wallet you're connected with. Use a wallet you control — not an exchange address.",
    verifyTitle: "Want the verified tick?",
    verifyBody:
      "After you post, put your dare code in your Instagram bio for a few minutes. We check it by hand and mark the handle as really yours — that's what tells backers they're funding a person and not a stranger using someone else's name.",
    before: "Before you post",
    checks: [
      "I'm 18 or over, and this is my dare — nobody is making me do it.",
      "If my target hits, I have 48 hours to upload one video. If I don't, backers are refunded and I keep nothing.",
      "Nobody else appears in my video without agreeing to it.",
      "I understand PUHBLICITY holds the pot until the dare settles, and takes 10% only if I'm paid.",
    ],
    fee: "Posting fee",
    refundable: "Refundable?",
    refundableVal: "No — it's what keeps spam off the board",
    submit: "Pay 0.02 SOL and post",
    connect: "Connect to post",
    firstDare:
      "First dare from a new wallet gets a quick look from us before it hits the board. Usually minutes.",
    pausedTitle: "Paused.",
    pausedBody: "No new dares right now. Money already pledged is unaffected.",
    errPick: "Pick a dare from the menu.",
    errName: "Your name goes on the board — 2 to 24 characters.",
    errTarget: "Target must be between 0.25 and 5.00 SOL. The ceiling is the ceiling.",
    errChecks: "Tick all four boxes — they're the whole deal.",
    payingFee: "Paying the 0.02 SOL posting fee…",
    reusingFee: "Reusing your already-paid posting fee…",
    opening: "Opening the dare…",
    working: "Working…",
    genericErr: "Something broke — your fee, if paid, is saved for retry.",
  },

  prove: {
    heading: "Send your proof",
    headingReplace: "Replace your proof",
    lede: (a: string) => `One video. We watch it, then ${a} SOL goes to your wallet.`,
    codeEyebrow: "Start the video with this",
    codeBody:
      "Say it out loud, or hold it up written down, in the first few seconds — before you do the dare.",
    codeHint:
      "No code, no payout. It's how we know the video was filmed for this dare and not pulled from somewhere else, and it's the only reason we can take your word for the rest.",
    pot: "Pot",
    cut: "Our cut (10%)",
    youGet: "You receive",
    deadline: "Deadline",
    needToSee: "What we need to see",
    needTail:
      "No cuts, no edits. If it doesn't match the dare we'll reject it and refund your backers — you'll get one line telling you why.",
    theVideo: "The video",
    drop: "Drop your video here",
    dropHint: "MP4, MOV or WebM · up to 50 MB · up to 90 seconds",
    chooseFile: "Choose a file",
    chooseOther: "Choose a different file",
    looksGood: (mb: string) => `${mb} MB — looks good`,
    noteLabel: "Anything we should know (optional)",
    notePlaceholder: "The timer's visible at 0:12.",
    whoSees: "Who sees this.",
    whoSeesBody:
      "Only us, until it's approved. Once you're paid, your backers can watch it for 48 hours on the dare page — that's what they paid for. Then we delete the file.",
    submit: "Send proof",
    replaceHint:
      "You can replace it any time before we review it. If we haven't reviewed within 24 hours, backers are refunded automatically.",
    errPick: "Pick the video first.",
    errType: "Video only: MP4, MOV or WebM.",
    errSize: "Over 50 MB — trim or compress it.",
    errLong: (max: number, actual: number) =>
      `Max ${max} seconds — yours is ${actual}s. One take, tight cut.`,
    checking: "Checking the video…",
    slot: "Getting an upload slot…",
    uploading: "Uploading…",
    finishing: "Finishing…",
    failed: "Upload failed — try again.",
  },

  mine: {
    heading: "My dares",
    connectTitle: "Your side of the board",
    connectBody: "Connect to see your dares, your pledges, and what's owed to you.",
    connect: "Connect wallet",
    paidToMe: "Paid to me",
    inOpenPots: "In open pots",
    iBacked: "I've backed",
    refundedToMe: "Refunded to me",
    queueTitle: "One of yours is in the queue.",
    queueBody:
      "A quick human check before it shows on the public board — usually minutes.",
    timeLeft: "Time left to prove it",
    willReceive: (pot: string, net: string) =>
      `Pot ${pot} SOL · you'll receive ${net} after our 10%`,
    everythingElse: "Everything else",
    yourDares: "Your dares",
    emptyTitle: "Nothing yet.",
    emptyBody: "Somebody has to go first. It costs 0.02 SOL to post.",
    postYours: "Post your dare",
    iveBacked: "Dares I've backed",
    thDare: "Dare",
    thPot: "Pot",
    thStatus: "Status",
    thSettled: "Settled",
    thMyPledge: "My pledge",
    receipt: "Receipt",
    view: "View",
    watch: "Watch",
    tx: "Tx",
    refundedInFull: "Refunded in full",
    loading: "Loading…",
  },

  wallet: {
    handoffEyebrow: "One step",
    handoffTitle: "Open this in your wallet",
    handoffBody: (browser: string) =>
      `${browser} can't talk to a wallet directly — that's a phone limitation, not ours. Phantom has its own browser built in, and everything works normally in there.`,
    safariIphone: "Safari on iPhone",
    yourBrowser: "Your browser",
    openInPhantom: "Open in Phantom",
    landHere:
      "You'll land on this exact page inside Phantom, wallet ready. Don't have it? Install Phantom, then come back and tap this again.",
    otherWallet: "Using a different wallet?",
    otherWalletBody: "Open its in-app browser and paste",
    authErrTitle: "Couldn't sign you in",
  },

  install: {
    title: "Put it on your home screen",
    android: "Full screen, no browser bar. One tap.",
    ios: "Tap Share, then “Add to Home Screen”.",
    button: "Install",
  },

  offline: {
    eyebrow: "No connection",
    title: "You're offline.",
    body: "Pots move in real time, so we won't show you a number we can't check. Nothing you've pledged is affected — reconnect and it'll all be here.",
    retry: "Try again",
  },
};

/** Deliberately NOT `as const`: literal types would make every Spanish
 *  string a type error. */
export type Dict = typeof en;
