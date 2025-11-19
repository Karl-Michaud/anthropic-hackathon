type ScholarshipInformationBlockProps = {
  scholarshipTitle: string
  scholarshipDescription: string
  scholarshipPrompt: string
  hiddenCriterion: string[]
}

function HiddenCriterion(text: string) {
  return <div className="rounded-full p-2 bg-blue-500">{text}</div>
}

export default function ScholarshipInformationBlock({
  scholarshipTitle,
  scholarshipDescription,
  scholarshipPrompt,
  hiddenCriterion,
}: ScholarshipInformationBlockProps) {
  return (
    <div className="">
      <div>{hiddenCriterion.map((item) => HiddenCriterion(item))}</div>
      <div>
        <h1 className="">{scholarshipTitle}</h1>
      </div>
      <div>
        <h2 className="">Description</h2>
        <p>{scholarshipDescription}</p>
      </div>
      <div>
        <h2 className="">Prompt</h2>
        <p>{scholarshipPrompt}</p>
      </div>
    </div>
  )
}
