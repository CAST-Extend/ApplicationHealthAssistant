const { getJestProjects } = require('@nx/jest');

module.exports = {
    projects: getJestProjects(),
    coverageThreshold: {
        global: {
            statements: 95,
            branches: 65,
            functions: 90,
            lines: 95,
        },
    },
};
