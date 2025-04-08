import { writeFile } from 'fs/promises';
import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, MongoClient } from 'mongodb';

import { PROJECT_NAME } from '@app/config';

@Injectable()
export default class MongoRepository {
    readonly MONGO_CERTIFICATE_PATH = './MongoCert.pem';

    mongoInstanceURL: string;

    databaseName: string;

    database: Db;
	
	private mongoClient: MongoClient; // Ensuring MongoClient is reused

    protected logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/combined.log' }),
        ],
    });

    /**
     * @param {ConfigService} configService - A service class that provides access to application configuration values to read from secrets and environmental variables.
     * @param {Logger} logger - A class that provides logging functionality to stdout.
     */
    constructor(
        private configService: ConfigService
    ) {
        //const password = this.configService.get<string>('API_MONGO_PW');
        //const url = this.configService.get<string>('API_MONGODB_API_DB_URL');
        // eslint-disable-next-line no-template-curly-in-string
        //this.mongoInstanceURL = url?.replace('${API_MONGO_PW}', password);
		this.mongoInstanceURL = this.configService.get<string>('API_MONGODB_API_DB_URL') || 'mongodb://127.0.0.1:27017/AHADB';
        this.databaseName = 'ApplicationHDev'; // Ensuring databaseName is set
    }

    /**
     * Creates a file containing the provided certificate data
     * @param {string} certificate - A string containing the certificate data to be written to the file.
     * @returns {Promise<void>} - A promise that resolves when the file has been successfully written, or rejected if an error occurs.
     */
    async createCertificateFile(certificate: string): Promise<void> {
        this.logger.info(
            `Attempting to write Mongo certificate to [${this.MONGO_CERTIFICATE_PATH}] with certificate of length [${certificate.length}].`
        );

        try {
            await writeFile(this.MONGO_CERTIFICATE_PATH, certificate);
            this.logger.info(
                `Mongo certificate was successfully written to [${this.MONGO_CERTIFICATE_PATH}].`
            );
        } catch (error) {
            this.logger.error(
                `There was an error writing the Mongo certificate to [${this.MONGO_CERTIFICATE_PATH}].`,
                { error }
            );

            throw error;
        }
    }

    /**
     * Establishes the connection for passed database name.
     * if database name does not exists - initDb will automatically create collection and populate data into it.
     * @returns {Promise<Db>} promise of Database
     */
    async getDatabase(): Promise<Db> {
        try {
            if (!this.mongoClient) {
                this.mongoClient = new MongoClient(this.mongoInstanceURL);
                await this.mongoClient.connect();
            }

            this.database = this.mongoClient.db(this.databaseName);

            if (!this.database) {
                throw new Error('Database connection is null or undefined');
            }

            await this.database.command({ ping: 1 }); // Ping MongoDB to verify the connection

            console.log('Database Check:', this.database);
            return this.database;
        } catch (error) {
            this.logger.error(`Error encountered while establishing connection to [${this.databaseName}]:`, { error });
            throw new Error('Unable to establish connection to the database');
        }
    }

    /**
     * This method can be invoked by sub class that implements the repository to perform initial
     * checks on the database
     *
     */
    // eslint-disable-next-line class-methods-use-this
    initDb(): void {}

    /**
     * Gets the collection passed to it
     * @see https://stackoverflow.com/questions/10656574/how-do-i-manage-mongodb-connections-in-a-node-js-web-application
     *
     * This method adds a prefix of project-key before the collection name.
     * if PREFIX_MONGO_COLLECTION_WITH_PROJECT_KEY flag is enabled
     * @param {string} collectionName - the name of the collection to query from.
     * @returns {Promise<Collection>} - instance of MongoDB collection, which other functions can query from.
     */
    async getCollection<T>(collectionName): Promise<Collection<T>> {
        /* const newCollectionName =
            this.configService.get<string>('PREFIX_MONGO_COLLECTION_WITH_PROJECT_KEY') === 'true'
                ? `${PROJECT_NAME.toLowerCase()}_${collectionName}`
                : collectionName; */
        return (await this.getDatabase()).collection<T>(collectionName);
    }
}