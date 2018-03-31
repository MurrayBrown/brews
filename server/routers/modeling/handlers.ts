import express = require("express");
import {sample_datasets, output_sample, table_data} from "./test_data";
import {modeling_db_config} from "../../environment";
import Database from "../../db";
import {select_models, select_datasets, job_status, job_output} from "./sql";

let rejected = (reason) => Promise.reject(reason);

function errorHandler(next: express.NextFunction, message: string) {
    console.log("ATP Error. Promoting to Express Error Handling.");
    next(new Error(message));
}

/**
 * TODO: Get list of models. Populate First Screen.
 select * from MLDEMO.ML_MODEL_MANAGER
 */
export function models(request: express.Request, response: express.Response, next: express.NextFunction) {
    let db = new Database(modeling_db_config);
    db.initialize()
        .then(() => {
            return db.preparedSelect(select_models, () => {
            }, {});
        })
        .then((result) => {
            response.send(result);
            response.end();
        }, rejected)
        .catch(errorHandler.bind(null, next));
}

/**
 * TODO: Get list of datasets. Populate Second Screen.
 select s.schemaname ||'.' || t.tablename from sys.sysschemas s join sys.systables t on s.schemaid = t.schemaid
 where t.tabletype <> 'S'
 and s.schemaname <> 'SYS'
 order by s.schemaname, t.tablename
 */
export function datasets(request: express.Request, response: express.Response, next: express.NextFunction) {
    let db = new Database(modeling_db_config);
    db.initialize()
        .then(() => {
            return db.preparedSelect(select_datasets, () => {
            }, {});
        })
        .then((result) => {
            response.send(result);
            response.end();
        }, rejected)
        .catch(errorHandler.bind(null, next));
}

/**
 * TODO: Add action item to job list. Exit Second Screen.
 insert into MLDEMO.ML_JOBS (
 NAME, TYPE, FEATURES_TABLE , STATUS, UPDATE_DATE)
 Values (?,?, ?, 'NEW', CURRENT_TIMESTAMP)
 */
export function action(request: express.Request, response: express.Response, next: express.NextFunction) {
    response.send("OK");
}

/**
 * TODO: Get list of jobs. Populate Third Screen.
 SELECT * FROM MLDEMO.ML_JOBS
 */
export function jobs(request: express.Request, response: express.Response, next: express.NextFunction) {
    let db = new Database(modeling_db_config);
    db.initialize()
        .then(() => {
            return db.preparedSelect(job_status, () => {
            }, {});
        })
        .then((result) => {
            response.send(result);
            response.end();
        }, rejected)
        .catch(errorHandler.bind(null, next));
}

/**
 * TODO: Get output for specific job. Populate Fourth Screen.
 SELECT * FROM MLDEMO.ML_RUN_OUTPUT WHERE JOB_ID=?
 */
export function output(request: express.Request, response: express.Response, next: express.NextFunction) {
    /**
     [ { ID: '2',
        NAME: 'lateness',
        TYPE: 'TRAIN',
        FEATURES_TABLE: 'MLDEMO.FEATURES',
        STATUS: { key: null, ref: null, props: {}, _owner: null, _store: {} },
        UPDATE_DATE: '2018-03-29 06:44:33.737' } ]
     */
    let job = {};
    if (request.body && request.body.length > 0) {
        job = request.body[0];
    }
    let db = new Database(modeling_db_config);
    db.initialize()
        .then(() => {
            return db.preparedSelect(
                job_output,
                noop,
                [job["ID"]]
            );
        })
        .then((result) => {
            response.send(result);
            response.end();
        }, rejected)
        .catch(errorHandler.bind(null, next));
}

function noop() {
}
