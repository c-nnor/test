"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const notes_module_1 = require("./notes/notes.module");
const prisma_service_1 = require("./prisma/prisma.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const auth_service_1 = require("./auth/auth.service");
const mail_module_1 = require("./mail/mail.module");
const mail_service_1 = require("./mail/mail.service");
const travelpath_controller_1 = require("./travelpath/travelpath.controller");
const travelpath_module_1 = require("./travelpath/travelpath.module");
const travelpath_service_1 = require("./travelpath/travelpath.service");
const leaderboard_controller_1 = require("./leaderboard/leaderboard.controller");
const leaderboard_module_1 = require("./leaderboard/leaderboard.module");
const leaderboard_service_1 = require("./leaderboard/leaderboard.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot(), notes_module_1.NotesModule, travelpath_module_1.TravelpathModule, prisma_module_1.PrismaModule, auth_module_1.AuthModule, mail_module_1.MailModule, travelpath_module_1.TravelpathModule, leaderboard_module_1.LeaderboardModule],
        controllers: [app_controller_1.AppController, travelpath_controller_1.TravelpathController, leaderboard_controller_1.LeaderboardController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService, auth_service_1.AuthService, mail_service_1.MailService, travelpath_service_1.TravelpathService, leaderboard_service_1.LeaderboardService]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map