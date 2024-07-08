import React from "react";
import { useState, useEffect, useRef } from "react";
import { FaHistory, FaSortDown } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import { BsPatchQuestion } from "react-icons/bs";
import { PiExportBold } from "react-icons/pi";

const Navbar = () => {
    const [projectTitle, setProjectTitle] = useState("Untitled Project");
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
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
            // console.log("ye hua execute");
            inputRef.current.focus();
        },100);
    };

    const handleSaveClick = () => {
        console.log("ye hua save");
        setIsEditing(false);
        localStorage.setItem("projectTitle", projectTitle);
        // console.log("Project Title saved to local storage" + projectTitle);
    };

    const handleClickOutside = (event) => {
        if(inputRef.current && !inputRef.current.contains(event.target)) {
            // handleSaveClick();
            // console.log("ye hua outside click karke save");
            setIsEditing(false);
            // const storedTitle = localStorage.getItem("projectTitle");
            // if(storedTitle) {
            //     setProjectTitle(storedTitle);
            // }
            localStorage.setItem("projectTitle", projectTitle);
            // console.log("outside click se Project Title saved to local storage" + projectTitle);

            setDropdownVisible(false);
            console.log(dropdownVisible);
            console.log("outside click se dropdown band ho gaya");
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

    const closeDropdown = (event) => {
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

    return (
        <nav className="bg-gray-800 px-4 shadow text-white">
            <div className="container mx-auto flex justify-between items-center">
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
                            <li><a className="block px-4 py-2 hover:bg-gray-600" href="#">Save</a></li>
                            <li><a className="block px-4 py-2 hover:bg-gray-600" href="#">Save As...</a></li>
                            <li className="border-t my-1"></li>
                            <li><a className="block px-4 py-2 hover:bg-gray-800" href="#">Save & Exit</a></li>
                        </ul>
                    </div>
                    <a className="" href="#">Undo</a>
                    <a className="" href="#">Redo</a>
                    <a className="flex items-center" href="#">
                        History
                        <FaHistory className="ml-2"/>
                    </a>
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
                            // console.log("1outside click se Project Title saved to local storage" + projectTitle);
                            // localStorage.setItem("projectTitle", projectTitle);
                            // console.log("2outside click se Project Title saved to local storage" + projectTitle);
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
                <div className="flex items-center space-x-4">
                    <button type="button" className="border-0">
                        <BsPatchQuestion className="text-xl cursor-pointer" title="Get Help"/>
                    </button>
                    <button className="btn btn-primary my-2 p-1 flex flex-row items-center justify-center rounded bg-blue-500 text-white font-semibold" type="submit" title="Export Video">
                        <a href="/export" className="mx-2">
                            Export
                        </a>
                        <PiExportBold className="mr-2 mb-1"/>
                    </button>
                    <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                        alt="User Avatar" 
                        className="rounded-full h-6 w-6 ring-2 ring-white" 
                    />
                </div>
            </div>
        </nav>
    );
        
}

export default Navbar;