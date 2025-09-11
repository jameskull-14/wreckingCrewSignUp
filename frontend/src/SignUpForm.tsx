import { useState, useEffect } from "react";


interface RowData {
  time: string;
  name: string;
  song: string;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let start = new Date();
  start.setHours(19, 0, 0, 0);
  let end = new Date();
  end.setHours(24, 0, 0, 0);

  while (start < end) {
    const hours = start.getHours();
    const minutes = start.getMinutes();
    const display = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(start);

    slots.push(display);
    start.setMinutes(minutes + 15); 
  }

  return slots;
}

interface RowData {
  time: string;
  name: string;
  song: string;
}

interface Song {
  id: number;
  title: string;
}

export default function SignupSheet() {
  const initialRows: RowData[] = generateTimeSlots().map((time) => ({
    time,
    name: "",
    song: "",
  }));

  const [rows, setRows] = useState<RowData[]>(initialRows);
  const [suggestions, setSuggestions] = useState<Song[][]>(
    Array(initialRows.length).fill([])
  );

  const handleChange = (index: number, field: keyof RowData, value: string) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );

    if (field === "song") {
      fetchSuggestions(index, value);
    }
  };

  const fetchSuggestions = async (index: number, query: string) => {
    if (!query) {
      setSuggestions((prev) =>
        prev.map((s, i) => (i === index ? [] : s))
      );
      return;
    }

    // fetch(`/api/songs?query=${encodeURIComponent(userInput)}`)
    // .then(res => res.json())
    // .then(data => console.log(data));    const data: Song[] = await res.json();

    // setSuggestions((prev) =>
    //   prev.map((s, i) => (i === index ? data : s))
    // );
  };

  const selectSuggestion = (rowIndex: number, songTitle: string) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, song: songTitle } : row
      )
    );
    setSuggestions((prev) =>
      prev.map((s, i) => (i === rowIndex ? [] : s))
    );
  };

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 p-2">Time</th>
          <th className="border border-gray-300 p-2">Name</th>
          <th className="border border-gray-300 p-2">Song</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.time}>
            <td className="border border-gray-300 p-2">{row.time}</td>
            <td className="border border-gray-300 p-2">
              <input
                type="text"
                value={row.name}
                onChange={(e) =>
                  handleChange(index, "name", e.target.value)
                }
                className="w-full p-1 border rounded"
              />
            </td>
            <td className="border border-gray-300 p-2 relative">
              <input
                type="text"
                value={row.song}
                onChange={(e) =>
                  handleChange(index, "song", e.target.value)
                }
                className="w-full p-1 border rounded"
              />
              {suggestions[index].length > 0 && (
                <ul className="absolute bg-white border mt-1 w-full z-10 max-h-32 overflow-auto">
                  {suggestions[index].map((song) => (
                    <li
                      key={song.id}
                      className="p-1 hover:bg-gray-200 cursor-pointer"
                      onClick={() =>
                        selectSuggestion(index, song.title)
                      }
                    >
                      {song.title}
                    </li>
                  ))}
                </ul>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
