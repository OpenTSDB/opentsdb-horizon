import { Component, Input, OnChanges, OnInit, SimpleChanges, HostBinding } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { IntercomService, IMessage } from '../../../core/services/intercom.service';
import { Subscription, Observable } from 'rxjs';
import * as moment from 'moment';




interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
@Component({
  selector: 'dashboard-version-history',
  templateUrl: './dashboard-version-history.component.html',
  styleUrls: ['./dashboard-version-history.component.scss'],

})
export class DashboardVersionHistoryComponent implements OnInit, OnChanges {
  @HostBinding('class.dashboard-version-history') private hostClass = true;

  @Input() payload = {};
  

  constructor(private interCom: IntercomService) {  }


  data = [
      {
        "id": 812,
        "fileid": null,
        "contentid": null,
        "createdtime": 1602613862000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 811,
        "fileid": null,
        "contentid": null,
        "createdtime": 1602613834000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 810,
        "fileid": null,
        "contentid": null,
        "createdtime": 1602086877000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 762,
        "fileid": null,
        "contentid": null,
        "createdtime": 1589833529000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 761,
        "fileid": null,
        "contentid": null,
        "createdtime": 1589831967000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 760,
        "fileid": null,
        "contentid": null,
        "createdtime": 1589827921000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 759,
        "fileid": null,
        "contentid": null,
        "createdtime": 1589826048000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 758,
        "fileid": null,
        "contentid": null,
        "createdtime": 1587771168000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 757,
        "fileid": null,
        "contentid": null,
        "createdtime": 1587771121000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 724,
        "fileid": null,
        "contentid": null,
        "createdtime": 1581628782000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 538,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568325270000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 537,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568325240000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 534,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568324845000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 533,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568324413000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 532,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568323976000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 531,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568242028000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 530,
        "fileid": null,
        "contentid": null,
        "createdtime": 1568240562000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 499,
        "fileid": null,
        "contentid": null,
        "createdtime": 1567104818000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 498,
        "fileid": null,
        "contentid": null,
        "createdtime": 1567101894000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 233,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561587949000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 231,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561583825000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 230,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561583647000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 226,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561488687000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 225,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561415792000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 206,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561162116000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 205,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561162079000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 204,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561161851000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 203,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561161744000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 202,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561155074000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 201,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561152999000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 194,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561137699000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 193,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561136146000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 190,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561068266000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 186,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561058639000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 185,
        "fileid": null,
        "contentid": null,
        "createdtime": 1561048348000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 184,
        "fileid": null,
        "contentid": null,
        "createdtime": 1560985177000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 183,
        "fileid": null,
        "contentid": null,
        "createdtime": 1560984792000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 180,
        "fileid": null,
        "contentid": null,
        "createdtime": 1560960645000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 179,
        "fileid": null,
        "contentid": null,
        "createdtime": 1560904004000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 125,
        "fileid": null,
        "contentid": null,
        "createdtime": 1559926065000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 127,
        "fileid": null,
        "contentid": null,
        "createdtime": 1559923238000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      },
      {
        "id": 126,
        "fileid": null,
        "contentid": null,
        "createdtime": 1559923212000,
        "createdBy": "user.syed",
        "creatorName": "Syed Abuthahir Sait Seenipeer"
      }
    ];
  
  history = { dates: [] , data: {} };
  visibleSections = {};
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.interCom.responseGet().subscribe((message: IMessage) => {
      switch (message.action) {
          case 'SetDashboardHistory':
            console.log("SetDashboardHistory", message);
            const res = message.payload.data.histories;
            const userNames = message.payload.data.userNames;
            const data = {};
            for (let i  = 0; i < res.length; i++ ) {
              const dt = moment.unix(res[i].createdTime/1000).format('YYYY-MM-DD') ; // moment.unix(time).format(dtFormat) : moment.unix(time).utc().format(dtFormat), 'time:raw': time };
              if (!data[dt] ) {
                data[dt] = [];
                this.visibleSections[dt] = true;
              };
              const userId = res[i].creatorId;
              data[dt].push({id: res[i].id, time: moment.unix(res[i].createdTime/1000).format('hh:mm a'), user: res[i].creatorId.substr(5) + ' (' + userNames[userId] + ')'});
            }

            this.history = { dates: Object.keys(data), data: data };
            break;
          }
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes=>", changes);
    if ( changes.payload && changes.payload.currentValue ) {
      this.loadHistory();  
    }
  }

  loadHistory() {
    this.interCom.requestSend(<IMessage> {
      action: 'GetDashboardHistory'
    }); 
    // this.id = null; 
  }

  loadVersion(id) {
    this.interCom.requestSend(<IMessage> {
      action: 'LoadDashboardVersion',
      id: id
    });
  }

  setDefaultVersion(id) {
    this.interCom.requestSend(<IMessage> {
      action: 'SetDashboardDefaultVersion',
      id: id
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
