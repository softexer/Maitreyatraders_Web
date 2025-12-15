import { Component, Inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { VerificationComponent } from "../verification/verification.component"
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog"
import { HttpErrorResponse } from "@angular/common/http"
import { SVITCustomerService } from "src/app/services/Maitreya-Customer.service"
import { MatSnackBar } from "@angular/material/snack-bar"
interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
}

interface TestState {
  currentQuestion: number
  userAnswers: (number | null)[]
  testStarted: boolean
  testFinished: boolean
  timeRemaining: number
}

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {

  state: TestState = {
    currentQuestion: 0,
    userAnswers: Array(3).fill(null),
    testStarted: false,
    testFinished: false,
    timeRemaining: 600,
  }

  timerInterval: any
  currentView: "start" | "test" | "results" = "test"

  liveResults: any = {
    correct: 0,
    wrong: 0,
    skipped: 0,
    marks: 0,
    scorePercent: 0,
    totalMarks: 0
  };
  finalResults: any = null;
  questions: Question[] = []

  showResults: boolean = false;
  timeUp: boolean = false;
  constructor(private router: Router,
    private dialog: MatDialog,
    private Customerservice: SVITCustomerService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.startTimer()
    const saved = JSON.parse(localStorage.getItem("SelectedTest") || "{}");

    if (!saved || !saved.questions) {
      console.error("No test found in localStorage");
      return;
    }

    this.questions = saved.questions;
    console.log(this.questions)
    const totalTime = this.questions.length * 2 * 60;

    this.state = {
      currentQuestion: 0,
      userAnswers: Array(this.questions.length).fill(null),
      testStarted: true,
      testFinished: false,
      timeRemaining: totalTime
    };

    this.startTimer();

  }

  // startTimer() {
  //   if (this.timerInterval) clearInterval(this.timerInterval);

  //   this.timerInterval = setInterval(() => {
  //     if (this.state.timeRemaining > 0) {
  //       this.state.timeRemaining--;
  //     } else {
  //       clearInterval(this.timerInterval);
  //       this.state.testFinished = true;
  //     }
  //   }, 1000);
  // }
startTimer() {
  if (this.timerInterval) clearInterval(this.timerInterval);

  this.timerInterval = setInterval(() => {
    if (this.state.timeRemaining > 0) {
      this.state.timeRemaining--;
      localStorage.setItem("timeRemaining", this.state.timeRemaining.toString());
    } 
    
    else {
      clearInterval(this.timerInterval);

      // TIME UP → DIRECT SUBMIT
      this.timeUp = true;     // show message
      this.finishTest();      // auto submit the test
      localStorage.removeItem("timeRemaining");
    }
  }, 1000);
}
formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const m = minutes < 10 ? '0' + minutes : minutes;
  const s = seconds < 10 ? '0' + seconds : seconds;

  return `${m}:${s}`;
}


  padZero(num: number): string {
    return num < 10 ? "0" + num : num.toString()
  }

  selectAnswer(optionIndex: number) {
    this.state.userAnswers[this.state.currentQuestion] = Number(optionIndex);
    // this.liveResults = this.getResults(); 

  }

  nextQuestion() {
    if (this.state.currentQuestion < this.questions.length - 1) {
      this.state.currentQuestion++
    }
  }

  previousQuestion() {
    if (this.state.currentQuestion > 0) {
      this.state.currentQuestion--
    }
  }

  finishTest() {
    this.state.testFinished = true
    this.currentView = "results"
    clearInterval(this.timerInterval)
  }

  submitTest() {
    this.finishTest()
    this.showResults = true;
  }

  closeResults() {
    localStorage.removeItem("SelectedTest")
    this.state = {
      currentQuestion: 0,
      userAnswers: Array(this.questions.length).fill(null),
      testStarted: false,
      testFinished: false,
      timeRemaining: 600,
    }
    this.currentView = "test"
    this.startTimer();
    this.router.navigateByUrl('/dashboard');
  }

  getCurrentQuestion() {
    return this.questions[this.state.currentQuestion] || {};
  }

  getResults() {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    this.state.userAnswers.forEach((answer, index) => {
      if (answer === null || answer === undefined) {
        skipped++;
      } else if (answer === this.questions[index].correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const totalQuestions = this.questions.length;
    const marks = correct * 2; // ✅ FIXED → 2 marks per correct answer
    const attempted = totalQuestions - skipped;
    const yet = skipped;

    return {
      correct,
      wrong,
      skipped,
      marks,              // ✅ Now correct
      totalQuestions,
      attempted,
      yet,
    };
  }

  getFinalResults() {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    this.questions.forEach((q, i) => {
      const ans = this.state.userAnswers[i];

      if (ans === null || ans === undefined) {
        skipped++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const marks = correct * 2;                  // 2 marks per correct
    const totalMarks = this.questions.length * 2;

    const scorePercent = Math.round((marks / totalMarks) * 100);

    return { correct, wrong, skipped, marks, scorePercent, totalMarks };
  }


  getOptionLetter(index: number) {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  isAnswered(index: number): boolean {
    return this.state.userAnswers[index] !== null
  }

  FetchMockTest1() {
    let payload = {
      userID: "svit2005@gmail.com"
    };
    this.Customerservice.GetMockTestPaper(payload).subscribe(
      (res: any) => {
        console.log(res)
        if (res.response == 3) {

          this.openSnackBar(res.message, "");
        }
        this.Customerservice.showLoader.next(false);
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        this.Customerservice.showLoader.next(false);
      }
    );
  }
  // FetchMockTest() {
  //   let payload = {
  //     userID: "svit2005@gmail.com"
  //   };

  //   this.Customerservice.GetMockTestPaper(payload).subscribe(
  //     (res: any) => {
  //       console.log(res);

  //       if (res.response == 3) {
  //         this.openSnackBar(res.message, "");
  //         return;
  //       }

  //       if (res.response == 1 && res.data?.preliminary?.length > 0) {

  //         // Get the first test from preliminary
  //         const prelim = res.data.preliminary[0];

  //         // Update questions dynamically
  //         this.questions = prelim.questions;

  //         // Update userAnswers based on question count
  //         this.state.userAnswers = Array(this.questions.length).fill(null);

  //         // Reset current question
  //         this.state.currentQuestion = 0;

  //         // Switch to test view
  //         this.currentView = "test";

  //         console.log("Updated questions:", this.questions);
  //       }

  //       this.Customerservice.showLoader.next(false);
  //     },
  //     (err: HttpErrorResponse) => {
  //       console.error(err);
  //       this.Customerservice.showLoader.next(false);
  //     }
  //   );
  // }
  FetchMockTest() {
    let payload = {
      userID: "svit2005@gmail.com"
    };

    this.Customerservice.GetMockTestPaper(payload).subscribe(
      (res: any) => {
        console.log(res);

        // if (res.response == 3) {
        //   this.openSnackBar(res.message, "");
        //   return;
        // }

        if (res.response == 1 && res.data?.preliminary?.length > 0) {

          // 🔍 Find the first preliminary entry that has questions
          const prelimWithQuestions = res.data.preliminary.find(
            (item: any) => item.questions && item.questions.length > 0
          );

          if (!prelimWithQuestions) {
            this.openSnackBar("No questions available.", "");
            return;
          }

          // ✅ Update questions dynamically
          this.questions = prelimWithQuestions.questions;

          // Initialize answers
          this.state.userAnswers = Array(this.questions.length).fill(null);

          this.state.currentQuestion = 0;
          this.currentView = "test";

          console.log("Loaded Questions:", this.questions);
        }

        this.Customerservice.showLoader.next(false);
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        this.Customerservice.showLoader.next(false);
      }
    );
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }

  Reveltest() {
    const questions = JSON.parse(localStorage.getItem("SelectedTest") || "[]");
  }
}
