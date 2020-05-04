import { MingleService } from '@totvs/mobile-mingle';
import { ScrollableTabs } from './../shared/scrollable-tabs/scrollable-tabs';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

//SERVICES
import { HttpService } from './http.service';
import { SessionService } from './session.service'

@Injectable()
export class ProjectsService {
    constructor(
        private _httpService: HttpService,
        private session: SessionService,
        private storage: Storage,
        private mingle: MingleService
    ) { }

    getProjects() {
        let url = `account/profile/${this.session.USER_ID}/projects`;
		
		return this._httpService.get(url, {})
			.map(res => {
                let temp = res.projects;
				let projects = [];
				
                for (let project of temp) {
                    let id = project.project.links.config.replace('/gdc/projects/', '');//pega o project ID
                    id = id.replace('/config', '');
                    let p = {
                        id: id,
                        name: project.project.meta.title,
                        description: project.project.meta.summary
                    }
                    projects.push(p);
                }
                return projects;
            }
        );
    }

    addProject(project): Observable<string> {
        return Observable.create(observer => {
			this.storage.set('project', project)
				.then(() => {
                    this.mingle.getUserData('projects/')
                        .subscribe((projectList: any) => {
                            let prj = {
                                id: project.id,
                                name: project.name
                            }
                            if ('projects' in projectList) {
                                projectList['projects'].push(prj);
                            } else {
                                projectList['projects'] = [];
                                projectList['projects'].push(prj);
                            }

                            //remove projectos duplicados caso existam
                            projectList.projects.reduce((a, b) => {
                                if (a.map(i => i.id).indexOf(b.id) < 0) a.push(b);
                                return a;
                            }, []);
							
                            this.mingle.saveUserData('projects', projectList)
                                .subscribe(() => {
                                    this.mingle.saveUserData(project.id, project)
                                        .subscribe(
                                        () => {
                                            observer.next('project saved');
                                        },
                                        (err) => {
                                            console.log('erro ao salvar na projeto');
                                        }
                                        );
                                },
                                (err) => {
                                    console.log('erro ao salvar na lista de projetos');
                                }
                                );
                        },
                        (err) => {

                        }
                        );
                });
        });

        //return this.storage.set('project',project);
    }

    setProject(project) {
		return this.storage.set('project', project)
			.then(() => {
                return this.mingle.saveUserData(project.id, project).toPromise();
            }
        );
    }

    getSavedProject() {
		return this.storage.get('project')
			.then(project => {
                if (project === null) {
                    throw new Error();
                }
                return project;
            });
    }

    getTabByIndex(index) {
		return this.getSavedProject()
			.then(project => {
                return project.tabs[index];
            });
    }

    updateReprot(report) {
		return this.getSavedProject()
			.then(project => {
                for (let tab in project.tabs) {
                    for (let rep in project.tabs[tab].reports) {
                        if (report.identifier === project.tabs[tab].reports[rep].identifier) {
                            project.tabs[tab].reports[rep] = report;
                            return this.setProject(project);
                        }
                    }
                }
            }
        );
    }

    updateTabReport(tab) {
		return this.getSavedProject()
			.then(project => {
                for (let savedTab in project.tabs) {
                    if (tab.id === project.tabs[savedTab].id) {
                        project.tabs[savedTab].reports = tab.reports;
                        this.storage.set('project', project);
                    }
                }
            }
        );
    }

    addNewTab(newTab) {
		return this.getSavedProject()
			.then(project => {
				project.tabs.push(newTab);
                return this.storage.set('project', project);
            });
    }

    removeTab(tabIndex) {
		return this.getSavedProject()
			.then(project => {
                project.tabs.splice(tabIndex, 1);
                return this.storage.set('project', project);
            });
    }

    removeProjectSettings(projectId:string){
        return this.mingle.getUserData('projects')
        	.flatMap((projectList: any) => {
                projectList.projects = projectList.projects.filter(project => {
					return project.id != projectId;
                });
                this.storage.set('project',null).then();
                return this.mingle.saveUserData('projects',projectList);
        	});
    }

}