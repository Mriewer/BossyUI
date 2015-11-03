angular.module('bossy.BKTree', ['bossy.utility'])
    .factory('BKTree', ['utility', function(utility) {

        /**
         * https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm
         * Computes edit distance between two strings.
         *
         * @param String str1
         * @param String str2
         */
        function levDist(str1, str2) {
            var i, j, mat = utility.createMatrix(str1.length + 1, str2.length + 1);
            // More readable if strings are 1-indexed
            // lower case for case-insensitive matching
            str1 = ' ' + str1.toLowerCase();
            str2 = ' ' + str2.toLowerCase();
            // Initialize first row values to edit distance from empty string
            for (i = 0; i < str1.length; i++) {
                mat[i][0] = i;
            }
            // Initialize first column values to edit distance from empty string
            for (j = 0; j < str2.length; j++) {
                mat[0][j] = j;
            }
            // Flood fill mat with edit distances between substrs of str1/str2
            for (j = 1; j < str2.length; j++) {
                for (i = 1; i < str1.length; i++) {
                    if (str1[i] === str2[j]) {
                        mat[i][j] = mat[i-1][j-1]; 
                    }
                    else {
                        mat[i][j] = Math.min(mat[i-1][j] + 1,    // a deletion
                                             mat[i][j-1] + 1,    // an insertion 
                                             mat[i-1][j-1] + 1); // a substitution
                    }
                }
            }
            return mat[str1.length - 1][str2.length - 1];
        }

        /**
         * http://blog.notdot.net/2007/4/Damn-Cool-Algorithms-Part-1-BK-Trees
         *
         * BKTrees utilize the metric space of strings' edit distance to 
         * greatly reduce the number of comparisons need to find all matches
         * to a query string within a specified edit distance. 
         *  
         * @param String str
         */
        var BKTreeNode = function(str) {
            this.str = str;
            this.children = {}; // key is edit-distance from this.str
        };

        BKTreeNode.prototype = {

            /**
             * @param BKTreeNode newNode
             */
            add: function(newNode) {
                var dist; // if newNode.str in tree, do nothing.
                if (newNode.str !== this.str) {
                    dist = levDist(newNode.str, this.str);
                    if (this.children[dist] === undefined) {
                        this.children[dist] = newNode;
                    }
                    else {
                        this.children[dist].add(newNode);
                    }
                }
            },

            /**
             * @param String query
             * @param int tolerance
             * @param { int: [String] } matchObj
             */
            search: function(query, tolerance, matchObj) {
                var i, dist = levDist(query, this.str);
                if (dist <= tolerance) {
                    matchObj[dist].push(this.str);
                }
                // Can't have negative distance
                i = dist - tolerance > 0 ? dist - tolerance : 0;
                for (; i <= dist + tolerance; i++) {
                    if(this.children[i]) {
                        this.children[i].search(query, tolerance, matchObj);
                    }
                }
            }

        };

        /**
         * @param [String] dict
         */
        function buildBKTree(dict) {
            var i, root = dict.length > 0 ? new BKTreeNode(dict[0]) : null;
            for (i = 1; i < dict.length; i++) {
                root.add(new BKTreeNode(dict[i]));
            }
            return root;
        }
    
        /**
         * @param BKTreeNode root
         * @param String query
         * @param int tolerance
         */
        function searchBKTree(root, query, tolerance) {
            var dist, matchObj = {}, matches = [];
            for (dist = 0; dist <= tolerance; dist++) {
                  matchObj[dist] = [];
            }
            root.search(query, tolerance, matchObj);
            for (dist = 0; dist <= tolerance; dist++) {
                  matches = matches.concat(matchObj[dist]);
            }
            return matches;
        }

        /**
         * @param [String] dict
         * @param int tolerance
         */
        return function(dict) {
            this._root = buildBKTree(dict);
            this.query = function(query, tolerance) {
                return this._root ? searchBKTree(this._root, query, tolerance) : [];
            };
        };
        
    }])
;

