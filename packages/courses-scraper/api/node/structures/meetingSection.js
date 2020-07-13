export default class MeetingSection {
    constructor(){
        this.sectionCode = ""
        this.instructors = []
        this.times = []
        this.size = 0
        this.enrolment = 0 
        this.notes = ""
    }

    setSectionCode(sectionCode){
        this.sectionCode = sectionCode
    }

    addInstructor(instructor){
        this.instructors.push(instructor)
    }

    addTimes(time){
        this.times.push(time)
    }

    setSize(size){
        this.size = size
    }

    setEnrolment(enrolment){
        this.enrolment = enrolment
    }

    setNotes(notes){
        this.notes = notes
    }

}