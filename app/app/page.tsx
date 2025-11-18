import Whiteboard from "./board/Whiteboard";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <Link
          href="/temp-test"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-lg"
        >
          Test Page
        </Link>
      </div>
      <Whiteboard />
    </>
  );
}
