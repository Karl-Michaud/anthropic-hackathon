type ScholarshipInformationBlockProps = {
  scholarshipTitle: string
  scholarshipDescription: string
  scholarshipPrompt: string
  hiddenCriterion: string[]
}

function HiddenCriterion(text: string) {
  return <div className="rounded-full px-4 py-2 bg-gray-800 text-white text-sm">{text}</div>
}

export default function ScholarshipInformationBlock({
  scholarshipTitle,
  scholarshipDescription,
  scholarshipPrompt,
  hiddenCriterion,
}: ScholarshipInformationBlockProps) {
  return (
    <div className="w-[600px] space-y-6 bg-white p-8 rounded-lg drop-shadow-lg">
      <div className="flex flex-wrap gap-2">
        {hiddenCriterion.map((item) => HiddenCriterion(item))}
      </div>
      <div>
        <h1 className="text-5xl font-bold text-black">{scholarshipTitle}</h1>
      </div>
      <div className="">
        <h2 className="text-lg font-medium text-black">Description</h2>
        <p className="text-black">{scholarshipDescription}</p>
      </div>
      <div className="">
        <h2 className="text-lg font-medium text-black">Prompt</h2>
        <p className="text-black">{scholarshipPrompt}</p>
      </div>
    </div>
  )
}
