/** Rubber-stamped state, telethon voice. */
export function StatusStamp({ status }: { status: string }) {
  switch (status) {
    case "OPEN":
      return <span className="stamp stamp--flare">Filling</span>;
    case "CLOSED":
      return <span className="stamp stamp--gold">Funded — proof due</span>;
    case "IN_REVIEW":
      return <span className="stamp stamp--gold">Proof in review</span>;
    case "PAID":
      return <span className="stamp stamp--paid">Paid out</span>;
    case "REFUNDING":
      return <span className="stamp stamp--refunded">Refunding</span>;
    case "REFUNDED":
      return <span className="stamp stamp--refunded">Refunded</span>;
    case "KILLED":
      return <span className="stamp stamp--refunded">Removed</span>;
    default:
      return null;
  }
}
