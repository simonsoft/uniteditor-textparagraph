var requireTest = require.context('./', true, /Spec\.js$/);
requireTest.keys().forEach(requireTest);
