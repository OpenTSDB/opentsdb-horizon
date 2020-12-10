import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';

import { LoggerService } from '../../core/services/logger.service';

import {
    DbfsPanelFolderModel,
    DbfsFileModel,
    DbfsFolderModel,
    DbfsNamespaceModel,
    DbfsResourcesModel,
    DbfsSyntheticFolderModel,
    DbfsUserModel
} from '../state/dbfs-resources.interfaces';

import { UtilsService } from '../../core/services/utils.service';

@Injectable()
export class DbfsUtilsService {

    constructor(
        private logger: LoggerService,
        private utils: UtilsService
    ) { }

    findTopPath(fullPath: string) {
        const pathParts = fullPath.split('/');
        if (pathParts.length > 3) {
            pathParts.splice(3, pathParts.length);
        }
        return pathParts.join('/');
    }

    findParentPath(fullPath: string) {
        const pathParts = fullPath.split('/');
        if (pathParts.length > 3) {
            pathParts.pop();
        }
        return pathParts.join('/');
    }

    findTrashPath(fullPath: string) {
        const topPath = this.findTopPath(fullPath);
        return topPath + '/trash';
    }

    detailsByFullPath(fullPath: string) {
        const details: any = {};

        const pathParts = fullPath.split('/');
        details.type = pathParts[1];
        details.typeKey = pathParts[2];
        details.topFolder = (pathParts.length === 3);
        details.topPath = this.findTopPath(fullPath);
        details.parentPath = this.findParentPath(fullPath);
        details.trashPath = details.topPath + '/trash';
        details.fullPath = fullPath;

        return details;
    }

    normalizeFolder(rawFolder: any, locked?: boolean): DbfsFolderModel {
        const details = this.detailsByFullPath(rawFolder.fullPath);
        const folder = <DbfsFolderModel>{...rawFolder,
            ownerType: details.type,
            resourceType: 'folder',
            icon: 'd-folder',
            loaded: false,
            parentPath: details.parentPath
        };

        if (!folder.files) {
            folder.files = [];
        }

        if (!folder.subfolders) {
            folder.subfolders = [];
        }

        if (details.topFolder) {
            folder.topFolder = true;
        }

        if (details.type) {
            folder[details.type] = details.typeKey;
        }

        if (details.trashPath === folder.fullPath) {
            folder.icon = 'd-trash';
            folder.trashFolder = true;
        }

        // locked flag
        if (locked) {
            folder.locked = true;
        }

        return folder;
    }

    normalizeFile(rawFile: any, locked?: boolean): DbfsFileModel {
        const details = this.detailsByFullPath(rawFile.fullPath);
        const file = <DbfsFileModel>{...rawFile,
            resourceType: 'file',
            ownerType: details.type,
            icon: 'd-dashboard-tile',
            parentPath: details.parentPath
        };
        if (
            (file.parentPath === '/namespace/yamas' && file.name === '_notifications_') ||
            (file.ownerType === 'user' && file.name === '_clipboard_')
        ) {
            file.hidden = true;
        }
        file[details.type] = details.typeKey;
        // locked flag
        if (locked) {
            file.locked = true;
        }

        //console.log('details', details);
        return file;
    }

    normalizePanelFolder(rawFolder: any, moveEnabled: boolean = true, selectEnabled: boolean = true, noDisplay: boolean = false): DbfsPanelFolderModel {

        // console.log('RAW FOLDER', rawFolder);
        const folder = this.normalizeFolder(rawFolder);

        const panelFolder: DbfsPanelFolderModel  = <DbfsPanelFolderModel>{...folder, moveEnabled, selectEnabled, selected: false};
        if (panelFolder.files) {
            delete panelFolder.files;
        }

        if (noDisplay === true) {
            panelFolder.noDisplay = true;
        }

        return panelFolder;
    }

}
