import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { GetnumberComponent } from "../getnumber/getnumber.component"
import { MatDialog } from "@angular/material/dialog"

import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { HttpErrorResponse } from "@angular/common/http"
import { SVITCustomerService } from "src/app/services/Maitreya-Customer.service"
import { MatSnackBar } from "@angular/material/snack-bar"

interface VideoItem {
  id: number;
  client_id: string;
  title: string;
  content: string;
  thumbnail: string;
  url: string;
  videoId: string;
  playing?: boolean;
  uploadPrgrm?: progrmfile[];
}
interface progrmfile {
  fileid: string;
  filepath: File | null;
  fileImg?: string;
  fileUrl?: string;
}
interface Test {
  id: number
  name: string
}
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  preliminaryTests: Test[] = []
  appNumberTests: Test[] = []
  hallTicketTests: Test[] = []
  videos: VideoItem[] = []
  selectedVideo: VideoItem | null = null
  showVideoModal = false
  user: any;
  isLoggedIn: boolean = false;
  baseUrl: any;
  examtype: string = '';

  constructor(private router: Router,
    private dialog: MatDialog,
    private Customerservice: SVITCustomerService,
    private snackBar: MatSnackBar,
  ) { }
  ngOnInit(): void {
    this.baseUrl = this.Customerservice.baseUrl;
    let usr = localStorage.getItem('svituser');
    if (usr) {
      this.user = JSON.parse(usr);
      console.log(this.user)
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
      this.router.navigateByUrl('/login');
    }
    this.examtype = localStorage.getItem('PreSelectExam') || '';
    console.log(this.examtype)
    this.loadMockTests();
    // this.initializeTests()
    // this.loadVideos()
  }
  playVideo(video: any) {
    this.videos.forEach(v => v.playing = false);
    video.playing = true;
  }
  initializeTests(): void {
    // Preliminary Tests (Direct Access)
    this.preliminaryTests = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Test ${i + 1}`,
    }))

    // Application Number Based Tests
    this.appNumberTests = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `App Test ${i + 1}`,
    }))

    // Hall Ticket Number Based Tests
    this.hallTicketTests = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `HT Test ${i + 1}`,
    }))
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }
  loadMockTests(): void {
    this.Customerservice.showLoader.next(true);
    const payload = { userID: "svit2005@gmail.com" };

    this.Customerservice.GetMockTestPaper(payload).subscribe(async (res: any) => {
      console.log(res)
      if (res.response !== 3) return;
      const selectedType = this.examtype?.trim().toLowerCase();
      // Preliminary
      this.preliminaryTests = (res.data.preliminary || [])
        .filter((t: any) =>
          t.type?.trim().toLowerCase() === selectedType &&
          t.questions?.length > 0
        )
        .map((t: any, i: number) => ({
          id: i + 1,
          name: `Prelim Test ${i + 1}`,
          questions: t.questions
        }));
      // this.preliminaryTests = (res.data.preliminary || [])
      //   .filter((t: any) => t.questions?.length > 0)
      //   .map((t: any, i: number) => ({
      //     id: i + 1,
      //     // name: t.testName || `Prelim Test ${i + 1}`,
      //     name: `Prelim Test ${i + 1}`,
      //     questions: t.questions
      //   }));

      // Application
      this.appNumberTests = (res.data.application || [])
        .filter((t: any) =>
          t.type?.trim().toLowerCase() === selectedType
        )
        .map((t: any, i: number) => ({
          id: i + 1,
          name: `App Test ${i + 1}`,
          questions: t.questions || []
        }));
      // this.appNumberTests = (res.data.application || [])
      //   .map((t: any, i: number) => ({
      //     id: i + 1,
      //     // name: t.testName || `App Test ${i + 1}`,
      //     name: `App Test ${i + 1}`,
      //     questions: t.questions || []
      //   }));

      // Hall Ticket
      this.hallTicketTests = (res.data.hallticket || [])
        .filter((t: any) =>
          t.type?.trim().toLowerCase() === selectedType
        )
        .map((t: any, i: number) => ({
          id: i + 1,
          name: `Hall Test ${i + 1}`,
          questions: t.questions || []
        }));
      // this.hallTicketTests = (res.data.hallticket || [])
      //   .map((t: any, i: number) => ({
      //     id: i + 1,
      //     // name: t.testName || `Hall Test ${i + 1}`,
      //     name: `Hall Test ${i + 1}`,
      //     questions: t.questions || []
      //   }));

      // Videos
      // this.videos = res.data.videolectures || [];
      const vids = res.data.videolectures || [];
      this.videos = [];
      for (const item of vids) {
        if (item.testURL) {
          const videoUrl = this.baseUrl + item.testURL;
          // Generate thumbnail
          const thumbnail = await this.generateMp4Thumbnail(videoUrl);
          const videoObj = {
            id: item._id,
            client_id: '',
            title: item.testName,
            content: "",
            url: videoUrl,
            thumbnail: thumbnail,
            videoId: item.testNumber.toString(),
            playing: false
          };
          this.videos.push(videoObj);
        }
      }

    });
    this.Customerservice.showLoader.next(false);
  }



  generateMp4Thumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous"; // safe for local assets
      video.muted = true;
      video.currentTime = 1;

      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
    });
  }

  DirestTestPaper(test: Test, testType: string): void {
    console.log(test)
    localStorage.setItem("SelectedTest", JSON.stringify(test));
    this.router.navigateByUrl('/exam');
  }

  onTestClick(test: Test, testType: string): void {
    console.log(test)
    localStorage.setItem("SelectedTest", JSON.stringify(test));
    let senddata = {
      title: "Enter Your Application Number"
    }
    const dialogRef = this.dialog.open(GetnumberComponent, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: "col-md-3",
      backdropClass: 'custom-backdrop',
      data: senddata
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res.istrue) {
        let mvalue = res.number
        if (this.user.applicationNo?.toLowerCase() === mvalue.toLowerCase() ||
          this.user.hallTicketNo?.toLowerCase() === mvalue.toLowerCase()
        ) {
          this.router.navigateByUrl('/exam');
        }
        else {
          let sendingnumber = "";
          let apiObj: any;
          if (testType === 'application') {
            apiObj = {
              userID: this.user.userID,
              applicationNumber: mvalue,
              hallTicketNumber: ""
            }
          }
          else {
            apiObj = {
              userID: this.user.userID,
              applicationNumber: "",
              hallTicketNumber: mvalue
            }
          }
          console.log(apiObj)
          this.Customerservice.SetToHallTktNo(apiObj).subscribe((posRes: any) => {
            console.log(posRes)
            if (posRes.response == 3) {
              this.Customerservice.showLoader.next(false);
              this.openSnackBar(posRes.message, "");
              this.router.navigateByUrl('/exam');
            } else {
              this.Customerservice.showLoader.next(false);
              this.openSnackBar(posRes.message, "");
              this.router.navigateByUrl('/login')
            }
          },
            (err: HttpErrorResponse) => {
              this.openSnackBar(err.message, "");
              this.Customerservice.showLoader.next(false);
              if (err.error instanceof Error) {
                console.warn("Client SIde Error", err.error);
              } else {
                console.warn("Server Error", err.error);
              }
            })
        }
      }
    });
  }

  onPlayVideo(video: any) {
    this.videos.forEach(v => v.playing = false); // stop any other playing
    video.playing = true;
  }

  closeVideoModal(): void {
    this.showVideoModal = false
    this.selectedVideo = null
  }

  Logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigateByUrl('/home')

  }
}
