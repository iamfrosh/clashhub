import {Global,Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";
import {EmailBatch,EmailBatchSchema,EmailJob,EmailJobSchema} from "../common/schemas";import {EmailService} from "./email.service";
@Global() @Module({imports:[MongooseModule.forFeature([{name:EmailBatch.name,schema:EmailBatchSchema},{name:EmailJob.name,schema:EmailJobSchema}])],providers:[EmailService],exports:[EmailService]})
export class EmailModule{}
