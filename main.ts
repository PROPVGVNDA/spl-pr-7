enum StudentStatus {
    Active,
    Academic_Leave,
    Graduated,
    Expelled
}

enum CourseType {
    Mandatory,
    Optional,
    Special
}

enum Semester {
    First,
    Second
}

enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}

enum Faculty {
    Computer_Science,
    Economics,
    Law,
    Engineering
}

interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}

class UniversityManagementSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: GradeRecord[] = [];

    // students registered for a course
    private courseRegistrations: { [key: number]: number[] } = {};
    // courses a student registered for
    private studentRegistrations: { [key: number]: number[] } = {};

    // unique IDs for students and courses
    private nextStudentId: number = 0;
    private nextCourseId: number = 0;

    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent: Student = { ...student, id: this.nextStudentId++ };
        this.students.push(newStudent);
        return newStudent;
    }

    registerForCourse(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student) {
            throw new Error("Student not found.");
        }

        if (!course) {
            throw new Error("Course not found.");
        }

        if (student.status !== StudentStatus.Active) {
            throw new Error("Only active students can register for courses.");
        }

        if (student.faculty !== course.faculty) {
            throw new Error("Student cannot register for a course from a different faculty.");
        }

        const registeredStudents = this.courseRegistrations[courseId] || [];
        if (registeredStudents.length >= course.maxStudents) {
            throw new Error("Course has reached maximum capacity.");
        }

        // init entry unless it exists
        if (!this.courseRegistrations[courseId]) {
            this.courseRegistrations[courseId] = [];
        }
        if (!this.studentRegistrations[studentId]) {
            this.studentRegistrations[studentId] = [];
        }

        this.courseRegistrations[courseId].push(studentId);
        this.studentRegistrations[studentId].push(courseId);
    }

    setGrade(studentId: number, courseId: number, grade: Grade): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student) {
            throw new Error("Student not found.");
        }

        if (!course) {
            throw new Error("Course not found.");
        }

        const registeredCourses = this.studentRegistrations[studentId] || [];
        if (!registeredCourses.includes(courseId)) {
            throw new Error("Student is not registered for this course.");
        }

        const gradeRecord: GradeRecord = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester
        };

        this.grades.push(gradeRecord);
    }

    updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);

        if (!student) {
            throw new Error("Student not found.");
        }

        if (student.status === StudentStatus.Graduated || student.status === StudentStatus.Expelled) {
            throw new Error("Cannot change status of a Graduated or Expelled student.");
        }

        student.status = newStatus;
    }

    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    getStudentGrades(studentId: number): GradeRecord[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }

    calculateAverageGrade(studentId: number): number {
        const studentGrades = this.grades.filter(g => g.studentId === studentId);
        if (studentGrades.length === 0) {
            return 0;
        }

        const total = studentGrades.reduce((sum, g) => sum + g.grade, 0);
        return total / studentGrades.length;
    }

    getExcellentStudentsByFaculty(faculty: Faculty): Student[] {
        const studentsInFaculty = this.getStudentsByFaculty(faculty);
        return studentsInFaculty.filter(student => {
            const avgGrade = this.calculateAverageGrade(student.id);
            return avgGrade >= Grade.Excellent;
        });
    }

    addCourse(course: Omit<Course, "id">): Course {
        const newCourse: Course = { ...course, id: this.nextCourseId++ };
        this.courses.push(newCourse);
        return newCourse;
    }
}
