import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Select from 'react-select';

const App = () => {
    const [options, setOptions] = useState([]);
    const times = generateTimes();

    // Load CSV data
    useEffect(() => {
        fetch('/data.csv')
            .then((response) => response.text())
            .then((data) => {
                const parsedData = Papa.parse(data, { header: true });
                const formattedOptions = parsedData.data.map((row) => ({
                    label: row['Song: Artist'], // Adjust column name if necessary
                    value: row.Number,
                }));
                setOptions(formattedOptions);
            });
    }, []);

    const handleInputChange = (rowIndex, value) => {
        console.log(`Row ${rowIndex} text box updated:`, value);
    };

    const handleDropdownChange = (rowIndex, selectedOption) => {
        console.log(`Row ${rowIndex} dropdown updated:`, selectedOption);
    };

    return (
        <div>
            <h1>DELCO WRECKING CREW</h1>
            <table>
                <thead>
                    <tr>
                        <th>Time Slot</th>
                        <th>Name</th>
                        <th>Song</th>
                    </tr>
                </thead>
                <tbody>
                    {times.map((time, index) => (
                        <tr key={index}>
                            <td>{time}</td>
                            <td>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        handleInputChange(index, e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Select
                                    options={options}
                                    onChange={(selectedOption) =>
                                        handleDropdownChange(
                                            index,
                                            selectedOption
                                        )
                                    }
                                    isSearchable
                                    placeholder="Select an option..."
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Helper function to generate times
const generateTimes = () => {
    const startHour = 18; // 6 PM
    const endHour = 24; // Midnight
    const interval = 15; // 15 minutes
    const times = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeString = `${hour % 12 || 12}:${minute
                .toString()
                .padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
            times.push(timeString);
        }
    }

    return times;
};

export default App;
