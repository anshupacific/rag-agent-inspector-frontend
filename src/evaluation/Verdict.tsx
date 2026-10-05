/** Pass or fail, as words and colour together so it never relies on colour alone. */
export default function Verdict({ passed }: { passed: boolean }) {
  return <span className={passed ? "badge badge-pass" : "badge badge-fail"}>{passed ? "Pass" : "Fail"}</span>;
}