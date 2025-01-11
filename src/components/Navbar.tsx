import React from "react";
import { useState, useEffect, useRef } from "react";
import { FaHistory, FaSortDown } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import { BsPatchQuestion } from "react-icons/bs";
import { PiExportBold } from "react-icons/pi";
import Image from "next/image";
import { observer } from "mobx-react";
import { StoreContext } from "@/store";

const Navbar = observer(() => {
    const store = React.useContext(StoreContext);
    const [projectTitle, setProjectTitle] = useState("Untitled Project");
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const storedTitle = localStorage.getItem("projectTitle");
        if(storedTitle) {
            setProjectTitle(storedTitle);
        }
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        },100);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        localStorage.setItem("projectTitle", projectTitle);
    };

    const handleClickOutside = (event : any) => { // event: MouseEvent
        if(inputRef.current && !inputRef.current.contains(event.target)) {
            setIsEditing(false);
            localStorage.setItem("projectTitle", projectTitle);
            setDropdownVisible(false);
        }
    };
    
    useEffect(() => {
        if(isEditing) {
            document.addEventListener("mousedown", handleClickOutside);
        } 
        else {
            document.removeEventListener("mousedown", handleClickOutside);
        }   

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing]);


    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const closeDropdown = (event : any) => {
        if (!event.target.closest('.dropdown')) {
        setDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", closeDropdown);
        return () => {
            document.removeEventListener("mousedown", closeDropdown);
        };
    }, []);

    // const handleSaveStore = () => {
    //     console.log("Save Store");
        
    // };

    // // Function to save state to JSON file
    // const saveStateToFile = () => {
    //     const state = { projectTitle };
    //     const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'state.json';
    //     a.click();
    //     URL.revokeObjectURL(url);
    // };

    // // Function to load state from JSON file
    // const loadStateFromFile = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         const state = JSON.parse(e.target.result);
    //         setProjectTitle(state.projectTitle);
    //         localStorage.setItem("projectTitle", state.projectTitle);
    //     };
    //     reader.readAsText(file);
    //     }
    // };


    // Function to save store state to JSON file
    const saveStateToFile = () => {
        const state = store.serialize();
        const blob = new Blob([state], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'state.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Function to load store state from JSON file
    const loadStateFromFile = (event : React.ChangeEvent<HTMLInputElement>) => {
        // const file = event.target.files[0];
        // if (file) {
        //     const reader = new FileReader();
        //     reader.onload = (e) => {
        //         const state = e.target.result;
        //         store.deserialize(state);
        //     };
        //     reader.readAsText(file);
        // }
        const files = event.target.files;

        // Check if the file type is JSON
        
        if (files && files.length > 0) {
            const file = files[0];
            
            if (file.type !== "application/json") {
                alert("Invalid file format. Please upload a JSON file.");
                event.target.value = '';  // Clear the input value to prevent file upload
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const state = e.target?.result as string;

                try {
                    store.deserialize(state);
                    alert("State successfully loaded from the JSON file.");
                } catch (error) {
                    console.error("Error during deserialization:", error);
                    alert("Error loading state from JSON file.");
                }

            };
            reader.readAsText(file);
        }
        else {
            console.error("No file selected. Please upload a JSON file.");
            alert("No file selected. Please upload a JSON file.");
        }
    };


    return (
        <nav className="
            bg-gray-800 
            px-4 shadow text-white">
            <div className="mx-2 w-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <a href="/" className="flex items-center text-slate-400">
                        <FaAngleLeft className="mb-1"/>
                        <div className="ml-2">Back to dashboard</div>
                    </a>
                    <div className="relative dropdown">
                        <button className="flex text-gray-200" onClick={toggleDropdown} aria-expanded="false">
                            Saved
                            <FaSortDown className="ml-2 "/>
                        </button>
                        <ul className={`absolute min-w-max border-sm rounded bg-gray-800/75 ${dropdownVisible ? "block" : "hidden"} text-white shadow-lg mt-2 py-2`}>
                            <li><a className="block px-4 py-2 hover:bg-gray-600" href="#" onClick={saveStateToFile}>Save</a></li>
                            <li><a className="block px-4 py-2 hover:bg-gray-600" href="#">Save As...</a></li>
                            <li className="border-t my-1"></li>
                            <li><a className="block px-4 py-2 hover:bg-gray-800" href="#" onClick={() => {
                                saveStateToFile();
                                window.location.href = "/";
                            }}>Save & Exit</a></li>
                        </ul>
                    </div>
                    {/* <a className="" href="#">Undo</a>
                    <a className="" href="#">Redo</a>
                    <a className="flex items-center" href="#">
                        History
                        <FaHistory className="ml-2"/>
                    </a> */}
                </div>
                <div className="flex items-center mx-auto">
                    <div className="flex items-center border-b-2 rounded">
                        <input 
                            ref={inputRef}
                            id="project-title"
                            type="text" 
                            className="form-input py-1 w-64 text-center focus:outline-none focus:bg-slate-600 bg-slate-600 rounded" 
                            placeholder="Project Title"
                            value={projectTitle}
                            disabled={!isEditing}
                            onChange={(e)=>{
                                setProjectTitle(e.target.value);
                            }}
                        />
                        <button
                            id="edit-project-title"
                            className={`btn mx-2 ${isEditing ? "hidden" : ""}`}
                            type="button"
                            onClick={handleEditClick}
                            title="Edit Project Title"
                        >
                            <FaPencilAlt />
                        </button>
                        <button
                            id="save-button"
                            className={`btn mx-2 ${isEditing ? '' : 'hidden'}`}
                            type="button"
                            onClick={handleSaveClick}
                            title="Save project title"
                        >
                            <FaCheck />
                        </button>
                    </div>
                </div>
                
                    
                <input type="file" accept=".json" onChange={loadStateFromFile} className="btn btn-secondary mx-2" />
                
                
                <div className="flex items-center space-x-4">
                    <Image 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="User Avatar"
                        width={24}
                        height={24}
                        className="rounded-full h-6 w-6 ring-2 ring-white"
                    />
                    <button className="btn btn-primary my-2 p-1 flex flex-row items-center justify-center rounded bg-blue-500 text-white font-semibold" type="submit" title="Export Video">
                        <a href="/export" className="mx-2">
                            Export
                        </a>
                        <PiExportBold className="mr-2 mb-1"/>
                    </button>
                    <button type="button" className="border-0">
                        <BsPatchQuestion className="text-xl cursor-pointer" title="Get Help"/>
                    </button>
                </div>

            </div>
        </nav>
    );
});

export default Navbar;