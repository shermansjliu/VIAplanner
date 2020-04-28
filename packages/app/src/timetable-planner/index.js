import { sortCourseSection, } from "./combinations/combinations";

const createShallowCopyOfTimetable = (timetable) => {
    let shallowCopy = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: []
    }
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    for (const day of days){
        shallowCopy[day].push(...timetable[day])
    }
    return shallowCopy
}

/**
 *
 * Helper function for OverlapExist
 * @param {Timetable} timetable
 * @param {string} day
 * @returns
 */
const checkOverlapForDay = (timetable, day) => {
    let section = 0;
    while (section < timetable[day].length) {
        let section2 = +section + +1;
        while (section2 < timetable[day].length) {
            if ((timetable[day][section].start >= timetable[day][section2].start &&
                timetable[day][section].start < timetable[day][section2].end) ||
                (timetable[day][section].end > timetable[day][section2].start &&
                    timetable[day][section].end <= timetable[day][section2].end)) {
                return true;
            }
            section2++;
        }
        section++;
    }
    return false;
};
/**
 *
 * Checks overlap of course times for each day in a timetable
 * @param {Timetable} timetable
 * @returns {boolean}
 */
const overlapExists = (timetable) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    let exists = false;
    for (const day of days) {
        exists = exists || checkOverlapForDay(timetable, day);
    }
    return exists;
};
/**
 *
 * Creates timetable by parse the meetingSections into each day and check for validity
 * @param {MeetingSection[]} courseSection
 * @returns {Timetable}
 */
const createTimetable = (courseSection) => {
    let timetable = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: []
    };
    // loop through each course for their lecture and check if the lectures are valid
    const lectureCombo = (courseSection, whichArray = 0, output = []) => {
        lectureCombo.founded = 0
        return courseSection[whichArray].lecture.some((arrayElement) => { 
            if (whichArray === courseSection.length - 1) {
                // Base case...
                //console.log("recur founded", lectureCombo.founded)
                const temp = [...output];
                temp.push(arrayElement);
                console.log("here",temp);
                for (const lec of temp) {
                    for (const time of lec.times) {
                        const timetableSection = {
                            code: lec.comboCode.substring(0, lec.comboCode.length - 5),
                            sectionCode: lec.sectionCode,
                            instructors: lec.instructors,
                            ...time,
                        };
                        timetable[time.day].push(timetableSection);
                    }
                }
                //console.log("temp of last array", temp)
                //if its invalid, clear the timetable and start again
                if (overlapExists(timetable)) {
                    //console.log("overlap")
                    timetable = {
                        MONDAY: [],
                        TUESDAY: [],
                        WEDNESDAY: [],
                        THURSDAY: [],
                        FRIDAY: []
                    };
                }
                else {
                    //console.log("no overlap")
                    // check if any course in the combo contains practical
                    let pra = -1
                    for (const section of courseSection) {
                        if (section.practical.length != 0) {
                            pra = courseSection.indexOf(section)
                            break
                        }
                    }
                    if (pra >= 0) {
                        //loop through each course for their practical and check if the practicals are valid with the lecture above
                        const prevTimetable = createShallowCopyOfTimetable(timetable)
                        const practicalCombo = (courseSection, whichArray2 = pra, output2 = []) => {
                            let pra2 = -1
                            for (const section of courseSection) {
                                if (section.practical.length != 0 && courseSection.indexOf(section) > whichArray2) {
                                    pra2 = courseSection.indexOf(section)
                                    break
                                }
                            }
                            //console.log("pra2", pra2)
                            if (pra2 != -1) {
                                return courseSection[whichArray2].practical.some((arrayElement2) => {
                                        // Recursive case...
                                        if (lectureCombo.founded == 1) {
                                            //console.log("founded in recur pra")
                                            return true
                                        }
                                        const temp = [...output2];
                                        temp.push(arrayElement2);
                                        practicalCombo(courseSection, pra2, temp);
                                })
                            } else {
                                return courseSection[whichArray2].practical.some((arrayElement2) => {
                                    if (lectureCombo.founded == 1) {
                                        //console.log("founded in pra 2")
                                        return true
                                    }
                                    console.log("prevtimetable with pra before modify timetable", prevTimetable)
                                    const temp = [...output2];
                                    temp.push(arrayElement2);
                                    for (const pra of temp) {
                                        for (const time of pra.times) {
                                            const timetableSection = {
                                                code: pra.comboCode.substring(0, pra.comboCode.length - 5),
                                                sectionCode: pra.sectionCode,
                                                instructors: pra.instructors,
                                                ...time,
                                            };
                                            timetable[time.day].push(timetableSection);
                                        }
                                    }
                                    console.log("temp of pra 2", temp)
                                    console.log("timetable with pra 2", timetable)
                                    console.log("prevtimetable with pra", prevTimetable)
                                    if (overlapExists(timetable)) {
                                        timetable = prevTimetable
                                        console.log("overlap in pra timetable", timetable)
                                        console.log("prevtimetable with pra after overlap", prevTimetable)
                                    }
                                    else {
                                        //console.log("no overlap in pra")
                                        let tut = -1
                                        for (const section of courseSection) {
                                            if (section.tutorial.length != 0) {
                                                tut = courseSection.indexOf(section)
                                                break
                                            }
                                        }
                                        if (tut >= 0) {
                                            let tut = -1
                                            for (const section of courseSection) {
                                                if (section.tutorial.length != 0) {
                                                    tut = courseSection.indexOf(section)
                                                    break
                                                }
                                            }
                                            if (tut >= 0) {
                                                //loop through each course for their practical and check if the practicals are valid with the lecture above
                                                const prevTimetable = createShallowCopyOfTimetable(timetable)
                                                const tutorialCombo = (courseSection, whichArray2 = tut, output2 = []) => {
                                                    let tut2 = -1
                                                    for (const section of courseSection) {
                                                        if (section.tutorial.length != 0 && courseSection.indexOf(section) > whichArray2) {
                                                            tut2 = courseSection.indexOf(section)
                                                            break
                                                        }
                                                    }
                                                    console.log("tut2", tut2)
                                                    if (tut2 != -1) {
                                                        return courseSection[whichArray2].tutorial.some((arrayElement2) => {
                                                            if (whichArray2 === courseSection.length - 1) {
                                                                // Base case...
                                                                const temp = [...output2];
                                                                temp.push(arrayElement2);
                                                                for (const tut of temp) {
                                                                    for (const time of tut.times) {
                                                                        const timetableSection = {
                                                                            code: tut.comboCode.substring(0, tut.comboCode.length - 5),
                                                                            sectionCode: tut.sectionCode,
                                                                            instructors: tut.instructors,
                                                                            ...time,
                                                                        };
                                                                        timetable[time.day].push(timetableSection);
                                                                    }
                                                                }
                                                                console.log("timetable with tut", timetable)
                                                                if (overlapExists(timetable)) {
                                                                    timetable = prevTimetable
                                                                }
                                                                else {
                                                                    return true
                                                                }
                                                            } else {
                                                                // Recursive case...
                                                                if (lectureCombo.founded == 1) {
                                                                    console.log("founded in recur tut")
                                                                    return true
                                                                }
                                                                const temp = [...output2];
                                                                temp.push(arrayElement2);
                                                                tutorialCombo(courseSection, tut2, temp);
                                                            }
                                                        })
                                                    } else {
                                                        return courseSection[whichArray2].tutorial.some((arrayElement2) => {
                                                            if (lectureCombo.founded == 1) {
                                                                console.log("founded in tut 2")
                                                                return true
                                                            }
                                                            const temp = [...output2];
                                                            temp.push(arrayElement2);
                                                            for (const tut of temp) {
                                                                for (const time of tut.times) {
                                                                    const timetableSection = {
                                                                        code: tut.comboCode.substring(0, tut.comboCode.length - 5),
                                                                        sectionCode: tut.sectionCode,
                                                                        instructors: tut.instructors,
                                                                        ...time,
                                                                    };
                                                                    timetable[time.day].push(timetableSection);
                                                                }
                                                            }
                                                            console.log("temp of tut 2", temp)
                                                            console.log("timetable with tut 2", timetable)
                                                            if (overlapExists(timetable)) {
                                                                timetable = prevTimetable
                                                                console.log("overlap in tut")
                                                            }
                                                            else {
                                                                return true
                                                            }
                                                        })
                                                    }
                                                }
                                                const tutResult = tutorialCombo(courseSection)
                                                console.log("tut result", tutResult)
                                                if (tutResult) {
                                                    console.log("tut end")
                                                    lectureCombo.founded = 1
                                                    return true
                                                }
                                            }
                                            else {
                                                return true
                                            }
                                            if (lectureCombo.founded == 1) {
                                                console.log("founded in basecase")
                                                return true
                                            }
                                        }
                                        else {
                                            // console.log("tut index2", tut)
                                            // console.log("pra end")
                                            lectureCombo.founded = 1
                                            return true
                                        }
                                    }
                                })
                            }
                        }
                        const praResult = practicalCombo(courseSection)
                        //console.log("pra result", praResult)
                        if (praResult) {
                            //console.log("pra end")
                            lectureCombo.founded = 1
                            return true
                        }
                    } else {
                        let tut = -1
                        for (const section of courseSection) {
                            if (section.tutorial.length != 0) {
                                tut = courseSection.indexOf(section)
                                break
                            }
                        }
                        if (tut >= 0) {
                            //loop through each course for their practical and check if the practicals are valid with the lecture above
                            const prevTimetable = createShallowCopyOfTimetable(timetable)
                            const tutorialCombo = (courseSection, whichArray2 = tut, output2 = []) => {
                                let tut2 = -1
                                for (const section of courseSection) {
                                    if (section.tutorial.length != 0 && courseSection.indexOf(section) > whichArray2) {
                                        tut2 = courseSection.indexOf(section)
                                        break
                                    }
                                }
                                console.log("tut2", tut2)
                                if (tut2 != -1) {
                                    return courseSection[whichArray2].tutorial.some((arrayElement2) => {
                                        if (whichArray2 === courseSection.length - 1) {
                                            // Base case...
                                            const temp = [...output2];
                                            temp.push(arrayElement2);
                                            for (const tut of temp) {
                                                for (const time of tut.times) {
                                                    const timetableSection = {
                                                        code: tut.comboCode.substring(0, tut.comboCode.length - 5),
                                                        sectionCode: tut.sectionCode,
                                                        instructors: tut.instructors,
                                                        ...time,
                                                    };
                                                    timetable[time.day].push(timetableSection);
                                                }
                                            }
                                            console.log("timetable with tut", timetable)
                                            if (overlapExists(timetable)) {
                                                timetable = prevTimetable
                                            }
                                            else {
                                                return true
                                            }
                                        } else {
                                            // Recursive case...
                                            if (lectureCombo.founded == 1) {
                                                console.log("founded in recur tut")
                                                return true
                                            }
                                            const temp = [...output2];
                                            temp.push(arrayElement2);
                                            tutorialCombo(courseSection, tut2, temp);
                                        }
                                    })
                                } else {
                                    return courseSection[whichArray2].tutorial.some((arrayElement2) => {
                                        if (lectureCombo.founded == 1) {
                                            console.log("founded in tut 2")
                                            return true
                                        }
                                        const temp = [...output2];
                                        temp.push(arrayElement2);
                                        for (const tut of temp) {
                                            for (const time of tut.times) {
                                                const timetableSection = {
                                                    code: tut.comboCode.substring(0, tut.comboCode.length - 5),
                                                    sectionCode: tut.sectionCode,
                                                    instructors: tut.instructors,
                                                    ...time,
                                                };
                                                timetable[time.day].push(timetableSection);
                                            }
                                        }
                                        console.log("temp of tut 2", temp)
                                        console.log("timetable with tut 2", timetable)
                                        if (overlapExists(timetable)) {
                                            timetable = prevTimetable
                                            console.log("overlap in tut")
                                        }
                                        else {
                                            return true
                                        }
                                    })
                                }
                            }
                            const tutResult = tutorialCombo(courseSection)
                            console.log("tut result", tutResult)
                            if (tutResult) {
                                console.log("tut end")
                                lectureCombo.founded = 1
                                return true
                            }
                        }
                        else {
                            return true
                        }
                        if (lectureCombo.founded == 1) {
                            //console.log("founded in basecase")
                            return true
                        }
                    }
                }
                if (lectureCombo.founded == 1) {
                    //console.log("founded in basecase 2")
                    return true
                }
            }
            else {
                // Recursive case...
                if (lectureCombo.founded == 1) {
                    //console.log("founded in recur")
                    return true
                }
                const temp = [...output];
                temp.push(arrayElement);
                // console.log("lec temp", temp)
                // console.log("recur founded", lectureCombo.founded)
                lectureCombo(courseSection, whichArray + 1, temp);
            }
        });
    };
    const result = lectureCombo(courseSection)
    console.log("result", result)

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    for (const day of days) {
        timetable[day].sort((a, b) => {
            return a.start - b.start;
        });
    }
    return timetable

};
/**
 *
 * The main function.
 * Starts from produce all section combinations of each course
 * Produce the combinations of the courses' section combinations
 * Create Timetable for each combinations of section combinations
 * Returns the master list of Timetables
 * @param {Course[]} courses
 * @returns {Timetable[]}
 */
const generateTimetables = (courses) => {
    // Generate all valid combinations of MeetingSections for a course
    console.log("courses", courses)
    const courseSections = courses.map(course => sortCourseSection(course));
    const timetable = createTimetable(courseSections)
    console.log("final timetable", timetable)
    return [timetable];
};
export { generateTimetables, createTimetable, overlapExists };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGdDQUFnQyxHQUFHLE1BQU0sNkJBQTZCLENBQUE7QUFFbkc7Ozs7OztHQU1HO0FBQ0gsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFNBQW9CLEVBQUUsR0FBVyxFQUFFLEVBQUU7SUFDN0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFBO0lBQ2YsT0FBTyxPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNwQyxJQUFJLFFBQVEsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUM1QixPQUFPLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLO2dCQUNoRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQzdELENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSztvQkFDekQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xFLE9BQU8sSUFBSSxDQUFBO2FBQ2Q7WUFDRCxRQUFRLEVBQUUs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